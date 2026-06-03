import { useState, useEffect } from 'react'
import { Search, Plus, Package, Scan } from 'lucide-react'
import { api } from '../services/api'
import { formatQ } from '../data/dummy'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function ModalProducto({ open, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({ codigo: '', nombre: '', precio: '', stock: '', categoria: '' })
  const [cargando, setCargando] = useState(false)

  const guardar = async () => {
    if (!form.codigo) {
      toast({ mensaje: 'El código del producto es requerido', tipo: 'warning' })
      return
    }
    if (!form.nombre || !form.precio) {
      toast({ mensaje: 'Nombre y precio son requeridos', tipo: 'warning' })
      return
    }
    setCargando(true)
    try {
      await api.post('/api/productos', {
        codigo: form.codigo,
        nombre: form.nombre,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        categoria: form.categoria || null,
      })
      toast({ mensaje: `"${form.nombre}" agregado`, tipo: 'exito' })
      setForm({ codigo: '', nombre: '', precio: '', stock: '', categoria: '' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Modal open={open} onClose={onClose} titulo="Nuevo producto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Código de barras / SKU</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ej: 7401051014890"
              value={form.codigo}
              onChange={set('codigo')}
              className="flex-1 min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base font-mono text-text placeholder:text-dim outline-none focus:border-primary"
            />
            <button
              onClick={() => toast({ mensaje: 'Escáner disponible en Fase 3', tipo: 'info' })}
              className="w-[52px] h-[52px] rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale shrink-0"
              aria-label="Escanear código"
            >
              <Scan size={20} className="text-muted" />
            </button>
          </div>
        </div>

        <Input label="Descripción / nombre" placeholder="Ej: Coca-Cola 600ml" value={form.nombre} onChange={set('nombre')} />

        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Precio de venta (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.precio} onChange={set('precio')} />
          </div>
          <div className="w-28">
            <Input label="Stock inicial" type="number" inputMode="numeric" placeholder="0" value={form.stock} onChange={set('stock')} />
          </div>
        </div>

        <Input label="Categoría" placeholder="Ej: Bebidas" value={form.categoria} onChange={set('categoria')} />

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Productos({ toast }) {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [modalNuevo, setModalNuevo] = useState(false)

  const cargarProductos = () => {
    api.get('/api/productos')
      .then(setProductos)
      .catch(() => toast({ mensaje: 'Error al cargar productos', tipo: 'error' }))
  }

  useEffect(() => { cargarProductos() }, [])

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stockColor = (stock) => {
    if (stock === 0) return 'danger'
    if (stock <= 5) return 'warning'
    return 'primary'
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text">Productos</h1>
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
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-11 pr-4 text-base text-text placeholder:text-dim outline-none focus:border-primary"
        />
      </div>

      <p className="text-xs text-muted mb-3">{filtrados.length} productos</p>

      <div className="flex flex-col gap-2">
        {filtrados.map((p) => (
          <div key={p.id} className="bg-surface border border-border rounded-xl px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                  <Package size={18} className="text-muted" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-text truncate">{p.nombre}</p>
                  <p className="text-xs text-dim font-mono mt-0.5">{p.codigo}</p>
                  <p className="text-xs text-muted">{p.categoria}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold tabular text-text">{formatQ(p.precio)}</p>
                <Badge variant={stockColor(p.stock)} className="mt-1">
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} und.`}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <Package size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Sin resultados</p>
          </div>
        )}
      </div>

      <ModalProducto
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        toast={toast}
        onGuardado={cargarProductos}
      />
    </div>
  )
}
