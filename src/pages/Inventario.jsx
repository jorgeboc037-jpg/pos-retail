import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Package, Scan, Trash2, Pencil, AlertTriangle, ArrowUp, ArrowDown, Clock, Layers, Hammer } from 'lucide-react'
import { api } from '../services/api'
import { formatQ, formatFecha } from '../data/dummy'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Scanner from '../components/Scanner'
import ModalGestionarComponentes from '../components/inventario/ModalGestionarComponentes'
import ModalArmarArreglo from '../components/inventario/ModalArmarArreglo'

// ─── Modal Nuevo Producto ────────────────────────────────────────────────────

function ModalNuevoProducto({ open, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', codigo: '', es_compuesto: false })
  const [scanner, setScanner] = useState(false)
  const [similares, setSimilares] = useState(null) // null=sin buscar, []=nada, [...]=hay
  const [cargando, setCargando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!open) { setForm({ nombre: '', precio: '', categoria: '', codigo: '', es_compuesto: false }); setSimilares(null) }
  }, [open])

  // Buscar similares al salir del campo nombre
  const buscarSimilares = async () => {
    if (!form.nombre.trim()) return
    const data = await api.get(`/api/productos/buscar?q=${encodeURIComponent(form.nombre.trim())}`)
    setSimilares(data)
  }

  const guardar = async (forzar = false) => {
    if (!form.nombre || !form.precio) {
      toast({ mensaje: 'Nombre y precio son requeridos', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      const data = await api.post('/api/productos', {
        nombre:    form.nombre,
        precio:    parseFloat(form.precio),
        categoria: form.categoria || null,
        codigo:    form.codigo || null,
        es_compuesto: form.es_compuesto,
        forzar,
      })
      toast({ mensaje: `"${data.nombre}" agregado (${data.sku})`, tipo: 'exito' })
      onGuardado()
      onClose()
    } catch (err) {
      if (err.similares) {
        setSimilares(err.similares)
      } else {
        toast({ mensaje: err.message, tipo: 'error' })
      }
    } finally {
      setCargando(false)
    }
  }

  // api.post lanza Error con .message, pero necesitamos parsear el body para `similares`
  // Sobrescribimos el catch para eso. El api.js ya lanza Error(data.error),
  // pero para 422 necesitamos la lista. Usamos fetch directo aquí no — en su lugar
  // modificamos el flujo: guardamos con forzar=false, si el backend retorna 422
  // el api.js lanza Error con el mensaje "Existen productos con nombres similares"
  // y necesitamos los similares. Mejor consultar /buscar antes de guardar.

  const handleGuardar = async () => {
    if (!form.nombre || !form.precio) {
      toast({ mensaje: 'Nombre y precio son requeridos', tipo: 'warning' }); return
    }
    // Si no buscamos similares aún, buscar primero
    if (similares === null) {
      await buscarSimilares()
      // setSimilares va a re-renderizar y el usuario ve los resultados
      // No guardamos aún — el usuario elige qué hacer
      return
    }
    await guardar(false)
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Nuevo producto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Nombre del producto</label>
          <input
            type="text"
            placeholder="Ej: Peluche corazón rojo"
            value={form.nombre}
            onChange={set('nombre')}
            onBlur={form.nombre.trim() ? buscarSimilares : undefined}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
          />
        </div>

        {/* Capa 4 — mostrar similares */}
        {similares !== null && similares.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle size={14} />
              <span className="font-medium">Productos similares encontrados</span>
            </div>
            {similares.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm text-text font-medium">{s.nombre}</p>
                  <p className="text-xs text-muted">{s.sku} · Stock: {s.stock}</p>
                </div>
                <span className="text-sm font-bold tabular text-text">{formatQ(s.precio)}</span>
              </div>
            ))}
            <p className="text-xs text-muted">¿Es un producto diferente a los de arriba?</p>
          </div>
        )}

        {similares !== null && similares.length === 0 && (
          <p className="text-xs text-primary">✓ No hay productos con nombre similar</p>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Precio de venta (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.precio} onChange={set('precio')} />
          </div>
          <div className="flex-1">
            <Input label="Categoría" placeholder="Ej: Peluches" value={form.categoria} onChange={set('categoria')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Código de barras (opcional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Escanear o dejar vacío"
              value={form.codigo}
              onChange={set('codigo')}
              className="flex-1 min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base font-mono text-text placeholder:text-dim outline-none focus:border-primary"
            />
            <button
              onClick={() => setScanner(true)}
              className="w-[52px] h-[52px] rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale shrink-0"
            >
              <Scan size={20} className="text-muted" />
            </button>
            <Scanner open={scanner} onDetectado={(c) => { setForm(f => ({ ...f, codigo: c })); setScanner(false) }} onClose={() => setScanner(false)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Tipo de producto</label>
          <div className="flex gap-2">
            {[[false, 'Producto simple'], [true, 'Arreglo (compuesto)']].map(([v, label]) => (
              <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, es_compuesto: v }))}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors active-scale ${
                  form.es_compuesto === v ? 'bg-primary text-primary-fg border-primary' : 'bg-surface-2 text-muted border-border'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-dim">El SKU se asigna automáticamente.</p>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          {similares !== null && similares.length > 0 ? (
            <>
              <Button variant="ghost" fullWidth onClick={() => guardar(true)} disabled={cargando}>
                {cargando ? '...' : 'Crear igual'}
              </Button>
              <Button fullWidth onClick={() => setSimilares(null)}>Revisar nombre</Button>
            </>
          ) : (
            <Button fullWidth onClick={handleGuardar} disabled={cargando}>
              {cargando ? 'Guardando...' : similares === null ? 'Siguiente' : 'Guardar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal Editar Producto ───────────────────────────────────────────────────

function ModalEditarProducto({ producto, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', codigo: '', es_compuesto: false })
  const [scanner, setScanner] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [gestionarComponentes, setGestionarComponentes] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre || '',
        precio: String(producto.precio ?? ''),
        categoria: producto.categoria || '',
        codigo: producto.codigo || '',
        es_compuesto: !!producto.es_compuesto,
      })
    }
  }, [producto])

  const guardar = async () => {
    if (!form.nombre || !form.precio) {
      toast({ mensaje: 'Nombre y precio son requeridos', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      const data = await api.put(`/api/productos/${producto.id}`, {
        nombre:    form.nombre,
        precio:    parseFloat(form.precio),
        categoria: form.categoria || null,
        codigo:    form.codigo || null,
        es_compuesto: form.es_compuesto,
      })
      toast({ mensaje: `"${data.nombre}" actualizado`, tipo: 'exito' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={!!producto} onClose={onClose} titulo="Editar producto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Nombre del producto</label>
          <input
            type="text"
            value={form.nombre}
            onChange={set('nombre')}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Precio de venta (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.precio} onChange={set('precio')} />
          </div>
          <div className="flex-1">
            <Input label="Categoría" placeholder="Ej: Peluches" value={form.categoria} onChange={set('categoria')} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Código de barras (opcional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Escanear o dejar vacío"
              value={form.codigo}
              onChange={set('codigo')}
              className="flex-1 min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base font-mono text-text placeholder:text-dim outline-none focus:border-primary"
            />
            <button
              onClick={() => setScanner(true)}
              className="w-[52px] h-[52px] rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale shrink-0"
            >
              <Scan size={20} className="text-muted" />
            </button>
            {producto && (
              <Scanner open={scanner} onDetectado={(c) => { setForm(f => ({ ...f, codigo: c })); setScanner(false) }} onClose={() => setScanner(false)} />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Tipo de producto</label>
          <div className="flex gap-2">
            {[[false, 'Producto simple'], [true, 'Arreglo (compuesto)']].map(([v, label]) => (
              <button key={String(v)} type="button" onClick={() => setForm(f => ({ ...f, es_compuesto: v }))}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors active-scale ${
                  form.es_compuesto === v ? 'bg-primary text-primary-fg border-primary' : 'bg-surface-2 text-muted border-border'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {form.es_compuesto && (
          <button
            type="button"
            onClick={() => setGestionarComponentes(true)}
            className="flex items-center justify-center gap-2 bg-surface-2 border border-border rounded-xl py-3 text-sm font-semibold text-text active-scale"
          >
            <Layers size={16} /> Gestionar componentes
          </button>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {producto && (
        <ModalGestionarComponentes
          producto={producto}
          open={gestionarComponentes}
          onClose={() => setGestionarComponentes(false)}
          toast={toast}
        />
      )}
    </Modal>
  )
}

// ─── Tab Catálogo ────────────────────────────────────────────────────────────

function TabCatalogo({ toast }) {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [modalNuevo, setModalNuevo] = useState(false)
  const [editando, setEditando] = useState(null)
  const [armando, setArmando] = useState(null)

  const cargar = () => {
    api.get('/api/productos')
      .then(setProductos)
      .catch(() => toast({ mensaje: 'Error al cargar productos', tipo: 'error' }))
  }

  const eliminar = async (p) => {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return
    try {
      await api.del(`/api/productos/${p.id}`)
      toast({ mensaje: `"${p.nombre}" desactivado`, tipo: 'exito' })
      cargar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  useEffect(() => { cargar() }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku?.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const stockColor = (stock) => stock === 0 ? 'danger' : stock <= 3 ? 'warning' : 'primary'

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{filtrados.length} productos</p>
        <button
          onClick={() => setModalNuevo(true)}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Nombre, SKU o código de barras..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-11 pr-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtrados.map((p) => (
          <button
            key={p.id}
            onClick={() => setEditando(p)}
            className="bg-surface border border-border rounded-xl px-4 py-4 text-left active-scale"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                  <Package size={18} className="text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-text line-clamp-2">{p.nombre}</p>
                  <p className="text-xs text-muted font-mono">{p.sku}{p.codigo ? ` · ${p.codigo}` : ''}</p>
                  {p.categoria && <p className="text-xs text-dim">{p.categoria}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold tabular text-text">{formatQ(p.precio)}</p>
                {p.costo_promedio > 0 && <p className="text-xs text-muted tabular">costo {formatQ(p.costo_promedio)}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1">
                {p.es_compuesto && <Badge variant="primary">Arreglo</Badge>}
                <Badge variant={stockColor(p.stock)}>
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} und.`}
                </Badge>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.es_compuesto && (
                  <span
                    role="button"
                    aria-label="Armar"
                    onClick={(e) => { e.stopPropagation(); setArmando(p) }}
                    className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-primary"
                  >
                    <Hammer size={15} />
                  </span>
                )}
                <span
                  role="button"
                  aria-label="Editar"
                  onClick={(e) => { e.stopPropagation(); setEditando(p) }}
                  className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-muted"
                >
                  <Pencil size={15} />
                </span>
                <span
                  role="button"
                  aria-label="Desactivar"
                  onClick={(e) => { e.stopPropagation(); eliminar(p) }}
                  className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-danger"
                >
                  <Trash2 size={15} />
                </span>
              </div>
            </div>
          </button>
        ))}
        {filtrados.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <Package size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Sin resultados</p>
          </div>
        )}
      </div>

      <ModalNuevoProducto
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        toast={toast}
        onGuardado={cargar}
      />

      <ModalEditarProducto
        producto={editando}
        onClose={() => setEditando(null)}
        toast={toast}
        onGuardado={cargar}
      />

      <ModalArmarArreglo
        producto={armando}
        onClose={() => setArmando(null)}
        toast={toast}
        onArmado={cargar}
      />
    </>
  )
}

// ─── Modal Ajuste ────────────────────────────────────────────────────────────

const MOTIVOS = [
  { value: 'producto_danado',    label: 'Producto dañado' },
  { value: 'producto_perdido',   label: 'Producto perdido' },
  { value: 'correccion_conteo',  label: 'Corrección de conteo' },
  { value: 'otro',               label: 'Otro motivo' },
]

function ModalAjuste({ open, onClose, toast, onGuardado }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [tipo, setTipo] = useState('AJUSTE_NEGATIVO')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('correccion_conteo')
  const [notas, setNotas] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!open) { setBusqueda(''); setResultados([]); setSeleccionado(null); setCantidad(''); setNotas('') }
  }, [open])

  useEffect(() => {
    if (!busqueda.trim()) { setResultados([]); return }
    const t = setTimeout(() => {
      api.get(`/api/productos/buscar?q=${encodeURIComponent(busqueda)}`)
        .then(setResultados).catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const guardar = async () => {
    if (!cantidad || parseInt(cantidad) < 1) {
      toast({ mensaje: 'Ingresá la cantidad', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      await api.post('/api/ajustes', {
        producto_id: seleccionado.id,
        tipo,
        cantidad: parseInt(cantidad),
        motivo,
        notas: notas || null,
      })
      toast({ mensaje: `Ajuste registrado en "${seleccionado.nombre}"`, tipo: 'exito' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const stockNuevo = seleccionado && cantidad
    ? tipo === 'AJUSTE_POSITIVO'
      ? seleccionado.stock + parseInt(cantidad || 0)
      : seleccionado.stock - parseInt(cantidad || 0)
    : null

  return (
    <Modal open={open} onClose={onClose} titulo="Ajuste de inventario">
      {!seleccionado ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-10 pr-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
            />
          </div>
          {resultados.map((p) => (
            <button key={p.id} onClick={() => setSeleccionado(p)}
              className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-xl border border-border active-scale text-left">
              <div>
                <p className="text-sm font-medium text-text">{p.nombre}</p>
                <p className="text-xs text-muted">{p.sku}</p>
              </div>
              <Badge variant={p.stock === 0 ? 'danger' : p.stock <= 3 ? 'warning' : 'muted'}>
                {p.stock} und.
              </Badge>
            </button>
          ))}
          {busqueda.trim() && resultados.length === 0 && (
            <p className="text-sm text-muted text-center py-2">Sin resultados</p>
          )}
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-primary/10 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary">{seleccionado.nombre}</p>
              <p className="text-xs text-muted">Stock actual: {seleccionado.stock} und. · {seleccionado.sku}</p>
            </div>
            <button onClick={() => setSeleccionado(null)} className="text-xs text-muted active-scale px-2">Cambiar</button>
          </div>

          <div className="flex gap-2">
            {[['AJUSTE_POSITIVO', 'Entrada (+)', 'primary'], ['AJUSTE_NEGATIVO', 'Salida (−)', 'danger']].map(([v, label, color]) => (
              <button key={v} onClick={() => setTipo(v)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors active-scale ${
                  tipo === v
                    ? color === 'primary' ? 'bg-primary text-primary-fg border-primary' : 'bg-danger text-danger-fg border-danger'
                    : 'bg-surface-2 text-muted border-border'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <Input label="Cantidad" type="number" inputMode="numeric" placeholder="0" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Motivo</label>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text outline-none focus:border-primary">
              {MOTIVOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted">Notas (opcional)</label>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Detalle del ajuste..."
              className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text outline-none focus:border-primary resize-none" />
          </div>

          {stockNuevo !== null && (
            <div className={`flex justify-between items-center rounded-xl px-4 py-3 ${stockNuevo < 0 ? 'bg-danger/10' : 'bg-surface-2'}`}>
              <span className="text-sm text-muted">Stock resultante</span>
              <span className={`text-base font-bold tabular ${stockNuevo < 0 ? 'text-danger' : 'text-text'}`}>
                {stockNuevo} und.
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
            <Button fullWidth onClick={guardar} disabled={cargando || stockNuevo < 0}>
              {cargando ? 'Guardando...' : 'Registrar ajuste'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Tab Ajustes ─────────────────────────────────────────────────────────────

function TabAjustes({ toast }) {
  const [ajustes, setAjustes] = useState([])
  const [modal, setModal] = useState(false)

  const cargar = () => {
    api.get('/api/ajustes')
      .then(setAjustes)
      .catch(() => toast({ mensaje: 'Error al cargar ajustes', tipo: 'error' }))
  }

  useEffect(() => { cargar() }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">Últimos 50 ajustes</p>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm">
          <Plus size={18} /> Nuevo ajuste
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {ajustes.map((a) => (
          <div key={a.id} className="bg-surface border border-border rounded-xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  a.tipo === 'AJUSTE_POSITIVO' ? 'bg-primary/10' : 'bg-danger/10'
                }`}>
                  {a.tipo === 'AJUSTE_POSITIVO'
                    ? <ArrowUp size={16} className="text-primary" />
                    : <ArrowDown size={16} className="text-danger" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text line-clamp-2">{a.productos?.nombre}</p>
                  <p className="text-xs text-muted">{MOTIVOS.find(m => m.value === a.motivo)?.label} · {formatFecha(a.created_at)}</p>
                  {a.notas && <p className="text-xs text-dim truncate">{a.notas}</p>}
                </div>
              </div>
              <span className={`text-sm font-bold tabular shrink-0 ${a.tipo === 'AJUSTE_POSITIVO' ? 'text-primary' : 'text-danger'}`}>
                {a.tipo === 'AJUSTE_POSITIVO' ? '+' : '−'}{a.cantidad}
              </span>
            </div>
          </div>
        ))}
        {ajustes.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <Clock size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Sin ajustes registrados</p>
          </div>
        )}
      </div>

      <ModalAjuste open={modal} onClose={() => setModal(false)} toast={toast} onGuardado={cargar} />
    </>
  )
}

// ─── Tab Kardex ──────────────────────────────────────────────────────────────

const TIPO_LABEL = {
  COMPRA:          { label: 'Compra',   color: 'text-primary',  icono: ArrowUp },
  VENTA:           { label: 'Venta',    color: 'text-danger',   icono: ArrowDown },
  AJUSTE_POSITIVO: { label: 'Ajuste +', color: 'text-primary',  icono: ArrowUp },
  AJUSTE_NEGATIVO: { label: 'Ajuste −', color: 'text-danger',   icono: ArrowDown },
}

function TabKardex({ toast }) {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargandoMov, setCargandoMov] = useState(false)

  useEffect(() => {
    if (!busqueda.trim()) { setResultados([]); return }
    const t = setTimeout(() => {
      api.get(`/api/productos/buscar?q=${encodeURIComponent(busqueda)}`)
        .then(setResultados).catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const cargarKardex = (prod) => {
    setSeleccionado(prod)
    setResultados([])
    setBusqueda(prod.nombre)
    setCargandoMov(true)
    api.get(`/api/kardex?producto_id=${prod.id}`)
      .then(setMovimientos)
      .catch(() => toast({ mensaje: 'Error al cargar kardex', tipo: 'error' }))
      .finally(() => setCargandoMov(false))
  }

  return (
    <>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Buscar producto para ver kardex..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setSeleccionado(null); setMovimientos([]) }}
          className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-11 pr-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
        />
      </div>

      {!seleccionado && resultados.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {resultados.map(p => (
            <button key={p.id} onClick={() => cargarKardex(p)}
              className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-xl border border-border active-scale text-left">
              <div>
                <p className="text-sm font-medium text-text">{p.nombre}</p>
                <p className="text-xs text-muted">{p.sku}</p>
              </div>
              <Badge variant={p.stock === 0 ? 'danger' : 'muted'}>{p.stock} und.</Badge>
            </button>
          ))}
        </div>
      )}

      {seleccionado && (
        <div className="bg-primary/10 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-primary">{seleccionado.nombre}</p>
          <p className="text-xs text-muted">{seleccionado.sku} · Stock actual: {seleccionado.stock} und. · Costo prom: {formatQ(seleccionado.costo_promedio)}</p>
        </div>
      )}

      {cargandoMov && <p className="text-sm text-muted text-center py-8">Cargando...</p>}

      {seleccionado && !cargandoMov && (
        <div className="bg-surface border border-border rounded-2xl px-4 py-4">
          <p className="text-sm font-semibold text-text mb-3">Movimientos</p>
          {movimientos.length === 0 && <p className="text-sm text-muted text-center py-4">Sin movimientos registrados</p>}
          {movimientos.map((m) => {
            const meta = TIPO_LABEL[m.tipo] || { label: m.tipo, color: 'text-muted', icono: Clock }
            const Icono = meta.icono
            return (
              <div key={m.id} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center shrink-0`}>
                    <Icono size={14} className={meta.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{meta.label}</p>
                    <p className="text-xs text-muted">{formatFecha(m.created_at)} · {m.usuarios?.nombre || '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold tabular ${meta.color}`}>
                    {m.tipo.includes('POSITIVO') || m.tipo === 'COMPRA' ? '+' : '−'}{m.cantidad}
                  </p>
                  <p className="text-xs text-muted tabular">{m.stock_antes} → {m.stock_despues}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!seleccionado && !busqueda && (
        <div className="flex flex-col items-center py-12 text-muted">
          <Search size={32} className="mb-3 opacity-40" />
          <p className="text-sm">Buscá un producto para ver su historial</p>
        </div>
      )}
    </>
  )
}

// ─── Page Inventario ─────────────────────────────────────────────────────────

const TABS = [['catalogo', 'Catálogo'], ['ajustes', 'Ajustes'], ['kardex', 'Kardex']]

export default function Inventario({ toast }) {
  const [tab, setTab] = useState('catalogo')

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-text mb-4">Inventario</h1>

      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-5">
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={['flex-1 py-2 rounded-lg text-sm font-medium transition-colors active-scale',
              tab === id ? 'bg-surface text-text shadow-sm' : 'text-muted'].join(' ')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'catalogo' && <TabCatalogo toast={toast} />}
      {tab === 'ajustes'  && <TabAjustes  toast={toast} />}
      {tab === 'kardex'   && <TabKardex   toast={toast} />}
    </div>
  )
}
