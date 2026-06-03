import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, PenLine, ChevronDown, ChevronUp, Scan, Check, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import { formatQ } from '../data/dummy'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Scanner from '../components/Scanner'

const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia']

function Ticket({ venta, onCerrar }) {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-text mb-1">¡Venta completada!</h3>
      <p className="text-muted text-sm mb-6">#{venta.numero} · {venta.metodo}</p>

      <div className="w-full bg-surface-2 rounded-xl p-4 mb-4">
        {venta.items.map((item, i) => (
          <div key={i} className="flex justify-between py-1.5 text-sm gap-2">
            <span className="text-muted truncate flex-1">{item.nombre} ×{item.cantidad}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.tieneDescuento && (
                <span className="tabular text-dim line-through text-xs">{formatQ(item.precioOriginal * item.cantidad)}</span>
              )}
              <span className={`tabular ${item.tieneDescuento ? 'text-warning font-semibold' : 'text-text'}`}>
                {formatQ(item.precio * item.cantidad)}
              </span>
            </div>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
          <span className="text-text">Total</span>
          <span className="tabular text-primary text-lg">{formatQ(venta.total)}</span>
        </div>
        {venta.metodo === 'Efectivo' && venta.recibido > venta.total && (
          <div className="flex justify-between text-sm mt-1 text-muted">
            <span>Cambio</span>
            <span className="tabular text-text">{formatQ(venta.recibido - venta.total)}</span>
          </div>
        )}
      </div>

      <Button fullWidth onClick={onCerrar}>Nueva venta</Button>
    </div>
  )
}

function ModalPago({ open, onClose, total, items, toast }) {
  const [metodo, setMetodo] = useState('Efectivo')
  const [recibido, setRecibido] = useState('')
  const [cargando, setCargando] = useState(false)
  const [ticket, setTicket] = useState(null)
  const { vaciarCarrito } = useStore()

  const cambio = recibido ? parseFloat(recibido) - total : 0

  const cobrar = async () => {
    if (metodo === 'Efectivo' && parseFloat(recibido) < total) {
      toast({ mensaje: 'El monto recibido es menor al total', tipo: 'error' })
      return
    }
    setCargando(true)
    try {
      const payload = {
        total,
        metodo_pago: metodo.toLowerCase(),
        recibido: metodo === 'Efectivo' ? parseFloat(recibido) || total : null,
        cambio: metodo === 'Efectivo' ? Math.max(0, (parseFloat(recibido) || total) - total) : null,
        items: items.map((i) => ({
          producto_id: i.esLibre ? null : i.id,
          nombre: i.nombre,
          precio_unitario: i.precio,
          precio_original: i.precioOriginal,
          cantidad: i.cantidad,
          es_libre: i.esLibre || false,
        })),
      }
      const { numero } = await api.post('/api/transacciones', payload)
      setTicket({ numero, total, metodo, recibido: parseFloat(recibido) || total, items })
      vaciarCarrito()
      toast({ mensaje: `Venta #${numero} registrada`, tipo: 'exito' })
    } catch (err) {
      toast({ mensaje: err.message || 'Error al registrar venta', tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const cerrar = () => {
    setTicket(null)
    setMetodo('Efectivo')
    setRecibido('')
    onClose()
  }

  return (
    <Modal open={open} onClose={ticket ? undefined : onClose} titulo={ticket ? 'Ticket' : 'Cobrar'}>
      {ticket ? (
        <Ticket venta={ticket} onCerrar={cerrar} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="bg-surface-2 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-muted text-sm">Total a cobrar</span>
            <span className="text-3xl font-bold tabular text-text">{formatQ(total)}</span>
          </div>

          <div>
            <p className="text-sm font-medium text-muted mb-2">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {METODOS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={[
                    'py-3 rounded-xl text-sm font-semibold border transition-colors duration-base active-scale',
                    metodo === m
                      ? 'bg-primary text-primary-fg border-primary'
                      : 'bg-surface-2 text-muted border-border',
                  ].join(' ')}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {metodo === 'Efectivo' && (
            <div>
              <label className="text-sm font-medium text-muted block mb-1.5">Monto recibido (Q)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder={formatQ(total).replace('Q', '')}
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-xl font-bold tabular text-text placeholder:text-dim outline-none focus:border-primary"
              />
              {recibido && cambio >= 0 && (
                <p className="text-sm text-muted mt-1.5">
                  Cambio: <span className="tabular font-semibold text-primary">{formatQ(cambio)}</span>
                </p>
              )}
            </div>
          )}

          <Button fullWidth onClick={cobrar} disabled={cargando}>
            {cargando ? 'Registrando...' : `Confirmar cobro · ${formatQ(total)}`}
          </Button>
        </div>
      )}
    </Modal>
  )
}

function EntradaManual({ onAgregar, toast }) {
  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState({ descripcion: '', precio: '', cantidad: '1' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const agregar = () => {
    if (!form.descripcion || !form.precio || parseFloat(form.precio) <= 0) {
      toast({ mensaje: 'Ingresá descripción y precio', tipo: 'warning' })
      return
    }
    onAgregar({
      id: `libre-${Date.now()}`,
      codigo: 'LIBRE',
      nombre: form.descripcion,
      precio: parseFloat(form.precio),
      cantidad: parseInt(form.cantidad) || 1,
      esLibre: true,
    })
    setForm({ descripcion: '', precio: '', cantidad: '1' })
  }

  return (
    <div className="mx-4 mb-2 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted active-scale bg-surface"
      >
        <span className="flex items-center gap-2">
          <PenLine size={16} className="text-warning" />
          Producto libre / precio especial
        </span>
        {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {abierto && (
        <div className="bg-surface-2 border-t border-border px-4 py-4 flex flex-col gap-3">
          <p className="text-xs text-muted">
            Usá esto para productos sin código, precios negociados o ítems que no están en el sistema todavía.
          </p>
          <input
            type="text"
            placeholder="Descripción del producto"
            value={form.descripcion}
            onChange={set('descripcion')}
            className="w-full min-h-touch rounded-xl bg-surface border border-border px-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                inputMode="decimal"
                placeholder="Precio Q"
                value={form.precio}
                onChange={set('precio')}
                className="w-full min-h-touch rounded-xl bg-surface border border-border px-4 text-base tabular text-text placeholder:text-dim outline-none focus:border-primary"
              />
            </div>
            <div className="w-20">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Cant."
                min="1"
                value={form.cantidad}
                onChange={set('cantidad')}
                className="w-full min-h-touch rounded-xl bg-surface border border-border px-4 text-base tabular text-text placeholder:text-dim outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={agregar}
              className="w-12 h-[52px] rounded-xl bg-primary flex items-center justify-center active-scale shrink-0"
              aria-label="Agregar al carrito"
            >
              <Plus size={20} className="text-primary-fg" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilaCarrito({ item, idx, onEliminar, onEditarPrecio }) {
  const [editando, setEditando] = useState(false)
  const [valor, setValor] = useState('')
  const inputRef = useRef(null)

  const precioActual = item.precioEditado ?? item.precio
  const tieneDescuento = item.precioEditado !== null && item.precioEditado !== undefined && item.precioEditado !== item.precio

  const iniciarEdicion = () => {
    setValor(String(precioActual))
    setEditando(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 50)
  }

  const confirmar = () => {
    const nuevo = parseFloat(valor)
    if (!isNaN(nuevo) && nuevo >= 0) {
      onEditarPrecio(idx, nuevo === item.precio ? null : nuevo)
    }
    setEditando(false)
  }

  const cancelar = () => setEditando(false)

  return (
    <div className="flex items-center gap-2 py-2 border-t border-border-dim first:border-0">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted truncate block">
          {item.nombre} ×{item.cantidad}
          {item.esLibre && <span className="ml-1 text-warning text-xs">(libre)</span>}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {editando ? (
          <>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmar(); if (e.key === 'Escape') cancelar() }}
              className="w-20 h-8 rounded-lg bg-surface border border-primary px-2 text-sm tabular text-text outline-none text-right"
            />
            <button onClick={confirmar} className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center active-scale">
              <Check size={13} className="text-primary-fg" />
            </button>
            <button onClick={cancelar} className="w-7 h-7 rounded-lg bg-surface-2 border border-border flex items-center justify-center active-scale">
              <X size={13} className="text-muted" />
            </button>
          </>
        ) : (
          <button onClick={iniciarEdicion} className="flex items-center gap-1 group active-scale" aria-label="Editar precio">
            {tieneDescuento && (
              <span className="text-xs tabular text-dim line-through">{formatQ(item.precio * item.cantidad)}</span>
            )}
            <span className={`text-sm tabular font-semibold ${tieneDescuento ? 'text-warning' : 'text-text'}`}>
              {formatQ(precioActual * item.cantidad)}
            </span>
            <PenLine size={11} className="text-dim group-active:text-primary" />
          </button>
        )}

        <button onClick={() => onEliminar(idx, item)} className="text-dim active-scale p-1 ml-1">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function POS({ toast }) {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [modalPago, setModalPago] = useState(false)
  const [scanner, setScanner] = useState(false)
  const { carrito, agregarAlCarrito, quitarDelCarrito, eliminarDelCarrito, eliminarPorIndice, editarPrecio, totalCarrito } = useStore()

  const onCodigoEscaneado = (codigo) => {
    setScanner(false)
    const producto = productos.find((p) => p.codigo === codigo)
    if (!producto) {
      toast({ mensaje: `Código "${codigo}" no encontrado`, tipo: 'warning' })
      return
    }
    if (producto.stock === 0) {
      toast({ mensaje: `"${producto.nombre}" sin stock`, tipo: 'warning' })
      return
    }
    agregarAlCarrito(producto)
    toast({ mensaje: `${producto.nombre} agregado`, tipo: 'exito', duracion: 1500 })
  }

  useEffect(() => {
    api.get('/api/productos')
      .then(setProductos)
      .catch(() => toast({ mensaje: 'Error al cargar productos', tipo: 'error' }))
  }, [])

  const productosFiltrados = productos.filter(
    (p) =>
      p.stock > 0 &&
      (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const total = totalCarrito()
  const itemsCarrito = carrito.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)]">
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-11 pr-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => setScanner(true)}
          className="w-[52px] h-[52px] rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale shrink-0"
          aria-label="Escanear código de barras"
        >
          <Scan size={22} className="text-muted" />
        </button>
      </div>

      <EntradaManual
        onAgregar={(item) => {
          const current = useStore.getState().carrito
          useStore.setState({ carrito: [...current, item] })
          toast({ mensaje: `"${item.nombre}" agregado`, tipo: 'exito', duracion: 1500 })
        }}
        toast={toast}
      />

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-muted">
            <Search size={28} className="mb-2 opacity-40" />
            <p className="text-sm">{busqueda ? `Sin resultados para "${busqueda}"` : 'Sin productos con stock'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {productosFiltrados.map((p) => {
              const enCarrito = carrito.find((i) => i.id === p.id)
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3 min-h-touch-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-text truncate">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm tabular text-primary font-semibold">{formatQ(p.precio)}</span>
                      <span className="text-xs text-dim font-mono">{p.codigo}</span>
                    </div>
                  </div>

                  {enCarrito ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center active-scale"
                        onClick={() => quitarDelCarrito(p.id)}
                        aria-label="Quitar"
                      >
                        <Minus size={16} className="text-text" />
                      </button>
                      <span className="w-8 text-center tabular font-bold text-text">{enCarrito.cantidad}</span>
                      <button
                        className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center active-scale"
                        onClick={() => agregarAlCarrito(p)}
                        aria-label="Agregar"
                      >
                        <Plus size={16} className="text-primary-fg" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center active-scale shrink-0"
                      onClick={() => {
                        agregarAlCarrito(p)
                        toast({ mensaje: `${p.nombre} agregado`, tipo: 'exito', duracion: 1500 })
                      }}
                      aria-label="Agregar al carrito"
                    >
                      <Plus size={20} className="text-primary-fg" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {carrito.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-surface">
          <div className="flex flex-col max-h-36 overflow-y-auto mb-3">
            {carrito.map((item, idx) => (
              <FilaCarrito
                key={item.esLibre ? `libre-${idx}` : `${item.id}-${idx}`}
                item={item}
                idx={idx}
                onEliminar={(i, it) => it.esLibre ? eliminarPorIndice(i) : eliminarDelCarrito(it.id)}
                onEditarPrecio={editarPrecio}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-muted text-xs">{itemsCarrito} {itemsCarrito === 1 ? 'producto' : 'productos'}</span>
              <p className="text-2xl font-bold tabular text-text">{formatQ(total)}</p>
            </div>
            <button
              onClick={() => setModalPago(true)}
              className="flex items-center gap-2 bg-primary text-primary-fg px-6 rounded-xl font-semibold min-h-touch active-scale"
            >
              <ShoppingCart size={20} />
              Cobrar
            </button>
          </div>
        </div>
      )}

      <ModalPago
        open={modalPago}
        onClose={() => setModalPago(false)}
        total={total}
        items={carrito.map((i) => ({
          id: i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio: i.precioEditado ?? i.precio,
          precioOriginal: i.precio,
          tieneDescuento: i.precioEditado !== null && i.precioEditado !== undefined && i.precioEditado !== i.precio,
          esLibre: i.esLibre || false,
        }))}
        toast={toast}
      />

      <Scanner open={scanner} onDetectado={onCodigoEscaneado} onClose={() => setScanner(false)} />
    </div>
  )
}
