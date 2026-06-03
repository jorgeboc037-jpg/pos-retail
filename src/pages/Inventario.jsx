import { useState, useEffect } from 'react'
import { Plus, Boxes } from 'lucide-react'
import { api } from '../services/api'
import { formatQ, formatFecha } from '../data/dummy'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function ModalIngreso({ open, onClose, toast, productos, onGuardado }) {
  const [form, setForm] = useState({ producto_id: '', cantidad: '', costo: '', proveedor: '' })
  const [cargando, setCargando] = useState(false)

  const guardar = async () => {
    if (!form.producto_id || !form.cantidad) {
      toast({ mensaje: 'Producto y cantidad son requeridos', tipo: 'warning' })
      return
    }
    setCargando(true)
    try {
      await api.post('/api/inventario', {
        producto_id: form.producto_id,
        cantidad: parseInt(form.cantidad),
        costo_unitario: form.costo ? parseFloat(form.costo) : null,
        proveedor: form.proveedor || null,
      })
      toast({ mensaje: 'Ingreso registrado', tipo: 'exito' })
      setForm({ producto_id: '', cantidad: '', costo: '', proveedor: '' })
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
    <Modal open={open} onClose={onClose} titulo="Registrar ingreso">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Producto</label>
          <select
            value={form.producto_id}
            onChange={set('producto_id')}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text outline-none focus:border-primary"
          >
            <option value="">Seleccionar...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <Input label="Cantidad recibida" type="number" inputMode="numeric" placeholder="0" value={form.cantidad} onChange={set('cantidad')} />
        <Input label="Costo unitario (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.costo} onChange={set('costo')} />
        <Input label="Proveedor" placeholder="Nombre del proveedor" value={form.proveedor} onChange={set('proveedor')} />
        {form.cantidad && form.costo && (
          <div className="bg-surface-2 rounded-xl px-4 py-3 flex justify-between text-sm">
            <span className="text-muted">Total ingreso</span>
            <span className="tabular font-bold text-text">{formatQ(parseFloat(form.cantidad) * parseFloat(form.costo))}</span>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Registrar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Inventario({ toast }) {
  const [modal, setModal] = useState(false)
  const [ingresos, setIngresos] = useState([])
  const [productos, setProductos] = useState([])

  const cargarDatos = () => {
    api.get('/api/inventario')
      .then(setIngresos)
      .catch(() => toast({ mensaje: 'Error al cargar inventario', tipo: 'error' }))
    api.get('/api/productos')
      .then(setProductos)
      .catch(() => {})
  }

  useEffect(() => { cargarDatos() }, [])

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text">Inventario</h1>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm"
        >
          <Plus size={18} /> Ingreso
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {ingresos.map((ing) => (
          <div key={ing.id} className="bg-surface border border-border rounded-xl px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-text truncate">{ing.producto?.nombre}</p>
                <p className="text-xs text-muted mt-0.5">
                  {ing.proveedor || 'Sin proveedor'} · {formatFecha(ing.created_at)}
                </p>
              </div>
              <div className="text-right shrink-0">
                {ing.costo_unitario ? (
                  <p className="text-base font-bold tabular text-text">{formatQ(ing.costo_unitario * ing.cantidad)}</p>
                ) : (
                  <p className="text-base font-bold text-muted">—</p>
                )}
                <p className="text-xs text-muted mt-0.5">{ing.cantidad} unidades</p>
              </div>
            </div>
          </div>
        ))}

        {ingresos.length === 0 && (
          <div className="flex flex-col items-center py-12 text-muted">
            <Boxes size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Sin ingresos registrados</p>
          </div>
        )}
      </div>

      <ModalIngreso
        open={modal}
        onClose={() => setModal(false)}
        toast={toast}
        productos={productos}
        onGuardado={cargarDatos}
      />
    </div>
  )
}
