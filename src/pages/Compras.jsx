import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Scan, ShoppingBag, ChevronRight, X } from 'lucide-react'
import { api } from '../services/api'
import { formatQ, formatFecha } from '../data/dummy'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Scanner from '../components/Scanner'

// ─── Buscador de producto para líneas de compra ──────────────────────────────

function BuscadorProducto({ onSeleccionar, toast }) {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState([])
  const [scanner, setScanner] = useState(false)

  useEffect(() => {
    if (!q.trim()) { setResultados([]); return }
    const t = setTimeout(() => {
      api.get(`/api/productos/buscar?q=${encodeURIComponent(q)}`)
        .then(setResultados).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const seleccionar = (p) => {
    onSeleccionar(p)
    setQ('')
    setResultados([])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Nombre, SKU o código de barras..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-9 pr-4 text-sm text-text placeholder:text-dim outline-none focus:border-primary"
          />
        </div>
        <button onClick={() => setScanner(true)}
          className="w-[52px] h-[52px] rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale shrink-0">
          <Scan size={20} className="text-muted" />
        </button>
        <Scanner
          open={scanner}
          onDetectado={(codigo) => { setQ(codigo); setScanner(false) }}
          onClose={() => setScanner(false)}
        />
      </div>

      {resultados.length > 0 && (
        <div className="flex flex-col gap-1">
          {resultados.map((p) => (
            <button key={p.id} onClick={() => seleccionar(p)}
              className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-xl border border-border active-scale text-left">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">{p.nombre}</p>
                <p className="text-xs text-muted">{p.sku} · Stock: {p.stock}{p.costo_promedio > 0 ? ` · Costo prom: ${formatQ(p.costo_promedio)}` : ''}</p>
              </div>
              <ChevronRight size={16} className="text-dim shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
      {q.trim() && resultados.length === 0 && (
        <p className="text-xs text-muted text-center py-2">Sin resultados — verificá el nombre o código</p>
      )}
    </div>
  )
}

// ─── Modal Nueva Compra ───────────────────────────────────────────────────────

function ModalNuevaCompra({ open, onClose, toast, onGuardado }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [cabecera, setCabecera] = useState({ fecha: hoy, proveedor: '', nit_proveedor: '', serie_factura: '', numero_factura: '', observaciones: '' })
  const [lineas, setLineas] = useState([])
  const [paso, setPaso] = useState(1) // 1=cabecera, 2=items
  const [cargando, setCargando] = useState(false)

  const setC = (k) => (e) => setCabecera(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!open) {
      setCabecera({ fecha: hoy, proveedor: '', nit_proveedor: '', serie_factura: '', numero_factura: '', observaciones: '' })
      setLineas([])
      setPaso(1)
    }
  }, [open])

  const agregarProducto = (p) => {
    const ya = lineas.find(l => l.producto_id === p.id)
    if (ya) {
      setLineas(ls => ls.map(l => l.producto_id === p.id ? { ...l, cantidad: l.cantidad + 1 } : l))
    } else {
      setLineas(ls => [...ls, {
        producto_id:    p.id,
        nombre:         p.nombre,
        sku:            p.sku,
        stock_actual:   p.stock,
        costo_promedio: p.costo_promedio,
        cantidad:       1,
        costo_unitario: p.costo_promedio > 0 ? p.costo_promedio : '',
      }])
    }
  }

  const actualizarLinea = (idx, campo, valor) => {
    setLineas(ls => ls.map((l, i) => i === idx ? { ...l, [campo]: valor } : l))
  }

  const quitarLinea = (idx) => setLineas(ls => ls.filter((_, i) => i !== idx))

  const total = lineas.reduce((s, l) => {
    const c = parseFloat(l.costo_unitario) || 0
    const q = parseInt(l.cantidad) || 0
    return s + c * q
  }, 0)

  const guardar = async () => {
    const invalidas = lineas.filter(l => !l.cantidad || parseInt(l.cantidad) < 1 || l.costo_unitario === '')
    if (invalidas.length > 0) {
      toast({ mensaje: 'Todas las líneas necesitan cantidad y costo', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      const { compra_id } = await api.post('/api/compras', {
        ...cabecera,
        items: lineas.map(l => ({
          producto_id:    l.producto_id,
          cantidad:       parseInt(l.cantidad),
          costo_unitario: parseFloat(l.costo_unitario),
        })),
      })
      toast({ mensaje: 'Compra registrada e inventario actualizado', tipo: 'exito' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Nueva compra">
      {paso === 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">Paso 1 de 2 — Datos de la factura</p>
          <Input label="Fecha" type="date" value={cabecera.fecha} onChange={setC('fecha')} />
          <Input label="Proveedor" placeholder="Nombre del proveedor" value={cabecera.proveedor} onChange={setC('proveedor')} />
          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="NIT proveedor" placeholder="CF" value={cabecera.nit_proveedor} onChange={setC('nit_proveedor')} />
            </div>
            <div className="flex-1">
              <Input label="Serie factura" placeholder="A" value={cabecera.serie_factura} onChange={setC('serie_factura')} />
            </div>
          </div>
          <Input label="N° de factura" placeholder="000-00000" value={cabecera.numero_factura} onChange={setC('numero_factura')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Observaciones (opcional)</label>
            <textarea value={cabecera.observaciones} onChange={setC('observaciones')} rows={2} placeholder="Notas adicionales..."
              className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
            <Button fullWidth onClick={() => {
              if (!cabecera.proveedor.trim()) { toast({ mensaje: 'El proveedor es requerido', tipo: 'warning' }); return }
              setPaso(2)
            }}>Siguiente →</Button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setPaso(1)} className="text-xs text-muted active-scale">← Volver</button>
            <p className="text-xs text-muted">Paso 2 de 2 — Productos</p>
          </div>
          <div className="bg-surface-2 rounded-xl px-3 py-2 text-xs text-muted">
            <span className="font-medium text-text">{cabecera.proveedor}</span>
            {cabecera.numero_factura && ` · Fact. ${cabecera.serie_factura}${cabecera.numero_factura}`}
            {' · '}{cabecera.fecha}
          </div>

          <BuscadorProducto onSeleccionar={agregarProducto} toast={toast} />

          {lineas.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted">{lineas.length} producto{lineas.length > 1 ? 's' : ''}</p>
              {lineas.map((l, idx) => (
                <div key={l.producto_id} className="bg-surface-2 border border-border rounded-xl px-3 py-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">{l.nombre}</p>
                      <p className="text-xs text-muted">{l.sku} · Stock actual: {l.stock_actual}</p>
                    </div>
                    <button onClick={() => quitarLinea(idx)} className="ml-2 text-danger active-scale">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-24">
                      <label className="text-xs text-muted block mb-1">Cantidad</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={l.cantidad}
                        onChange={(e) => actualizarLinea(idx, 'cantidad', e.target.value)}
                        className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm text-text outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted block mb-1">Costo unitario (Q)</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={l.costo_unitario}
                        onChange={(e) => actualizarLinea(idx, 'costo_unitario', e.target.value)}
                        className="w-full h-10 rounded-xl bg-surface border border-border px-3 text-sm text-text outline-none focus:border-primary"
                      />
                    </div>
                    <div className="w-20 flex flex-col justify-end">
                      <label className="text-xs text-muted block mb-1">Subtotal</label>
                      <p className="h-10 flex items-center text-sm font-bold tabular text-text">
                        {formatQ((parseFloat(l.costo_unitario) || 0) * (parseInt(l.cantidad) || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center bg-surface border border-border rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-text">Total compra</span>
                <span className="text-xl font-bold tabular text-text">{formatQ(total)}</span>
              </div>
            </div>
          )}

          {lineas.length === 0 && (
            <div className="flex flex-col items-center py-6 text-muted">
              <ShoppingBag size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Buscá y agregá productos</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
            <Button fullWidth onClick={guardar} disabled={cargando || lineas.length === 0}>
              {cargando ? 'Guardando...' : 'Registrar compra'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Vista detalle de compra ──────────────────────────────────────────────────

function DetalleCompra({ compra, onVolver }) {
  return (
    <div>
      <button onClick={onVolver} className="flex items-center gap-1 text-sm text-muted mb-4 active-scale">
        ← Volver
      </button>

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        <p className="text-base font-bold text-text mb-1">{compra.proveedor}</p>
        <p className="text-xs text-muted">{compra.fecha}{compra.numero_factura ? ` · Fact. ${compra.serie_factura || ''}${compra.numero_factura}` : ''}</p>
        {compra.nit_proveedor && <p className="text-xs text-muted">NIT: {compra.nit_proveedor}</p>}
        {compra.observaciones && <p className="text-xs text-dim mt-1 italic">{compra.observaciones}</p>}
      </div>

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        <p className="text-sm font-semibold text-text mb-3">Productos</p>
        {(compra.compra_items || []).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium truncate">{item.productos?.nombre}</p>
              <p className="text-xs text-muted">{item.productos?.sku} · {item.cantidad} × {formatQ(item.costo_unitario)}</p>
            </div>
            <p className="text-sm font-bold tabular text-text shrink-0 ml-2">{formatQ(item.subtotal)}</p>
          </div>
        ))}
        <div className="flex justify-between items-center pt-3 border-t-2 border-border mt-2">
          <span className="text-sm font-bold text-text">Total</span>
          <span className="text-xl font-bold tabular text-text">{formatQ(compra.total)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page Compras ─────────────────────────────────────────────────────────────

export default function Compras({ toast }) {
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [detalle, setDetalle] = useState(null)

  const cargar = () => {
    setCargando(true)
    api.get('/api/compras')
      .then(setCompras)
      .catch(() => toast({ mensaje: 'Error al cargar compras', tipo: 'error' }))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  if (detalle) return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-text mb-5">Compras</h1>
      <DetalleCompra compra={detalle} onVolver={() => setDetalle(null)} />
    </div>
  )

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text">Compras</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm">
          <Plus size={18} /> Nueva
        </button>
      </div>

      {cargando && <p className="text-sm text-muted text-center py-8">Cargando...</p>}

      {!cargando && compras.length === 0 && (
        <div className="flex flex-col items-center py-12 text-muted">
          <ShoppingBag size={32} className="mb-3 opacity-40" />
          <p className="text-sm">Sin compras registradas</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {compras.map((c) => (
          <button key={c.id} onClick={() => setDetalle(c)}
            className="bg-surface border border-border rounded-xl px-4 py-4 text-left active-scale w-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-text truncate">{c.proveedor}</p>
                <p className="text-xs text-muted mt-0.5">
                  {c.fecha}
                  {c.numero_factura ? ` · Fact. ${c.serie_factura || ''}${c.numero_factura}` : ''}
                  {` · ${(c.compra_items || []).length} producto${(c.compra_items || []).length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold tabular text-text">{formatQ(c.total)}</p>
                <ChevronRight size={14} className="text-dim ml-auto mt-1" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <ModalNuevaCompra
        open={modal}
        onClose={() => setModal(false)}
        toast={toast}
        onGuardado={cargar}
      />
    </div>
  )
}
