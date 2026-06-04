import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, Download, FileText } from 'lucide-react'
import { getNegocioConfig } from './Config'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../services/api'
import { formatQ, formatFecha } from '../data/dummy'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CATEGORIAS_GASTO = ['Proveedor', 'Alquiler', 'Servicios', 'Empleados', 'Transporte', 'Otros']

function buildChartData(transacciones, rango) {
  const dias = rango === 'semana' ? 7 : 30
  const resultado = []
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - i)
    const fechaStr = fecha.toISOString().split('T')[0]
    const label = rango === 'semana'
      ? fecha.toLocaleDateString('es-GT', { weekday: 'short' })
      : String(fecha.getDate())
    const ventas = transacciones
      .filter((t) => t.created_at.startsWith(fechaStr))
      .reduce((s, t) => s + parseFloat(t.total), 0)
    resultado.push({ dia: label, ventas, esHoy: i === 0 })
  }
  return resultado
}

function buildTop5(transacciones) {
  const mapa = {}
  for (const t of transacciones) {
    for (const item of (t.items || [])) {
      const key = item.nombre
      if (!mapa[key]) mapa[key] = { nombre: key, ventas: 0, total: 0 }
      mapa[key].ventas += item.cantidad
      mapa[key].total += parseFloat(item.precio_unitario) * item.cantidad
    }
  }
  return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface border border-border rounded-xl px-3 py-2 text-sm">
        <span className="text-text tabular font-semibold">{formatQ(payload[0].value)}</span>
      </div>
    )
  }
  return null
}

function ModalGasto({ open, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({ descripcion: '', monto: '', categoria: 'Otros', fecha: new Date().toISOString().split('T')[0] })
  const [cargando, setCargando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    if (!form.descripcion || !form.monto) {
      toast({ mensaje: 'Descripción y monto son requeridos', tipo: 'warning' })
      return
    }
    setCargando(true)
    try {
      await api.post('/api/gastos', { ...form, monto: parseFloat(form.monto) })
      toast({ mensaje: 'Gasto registrado', tipo: 'exito' })
      setForm({ descripcion: '', monto: '', categoria: 'Otros', fecha: new Date().toISOString().split('T')[0] })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Registrar gasto">
      <div className="flex flex-col gap-4">
        <Input label="Descripción" placeholder="Ej: Pago a proveedor XYZ" value={form.descripcion} onChange={set('descripcion')} />
        <Input label="Monto (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.monto} onChange={set('monto')} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Categoría</label>
          <select value={form.categoria} onChange={set('categoria')}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text outline-none focus:border-primary">
            {CATEGORIAS_GASTO.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Input label="Fecha" type="date" value={form.fecha} onChange={set('fecha')} />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function ModalCompra({ open, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    nit_proveedor: '',
    numero_factura: '',
    descripcion: '',
    monto: '',
  })
  const [cargando, setCargando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    if (!form.proveedor || !form.monto) {
      toast({ mensaje: 'Proveedor y monto son requeridos', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      await api.post('/api/compras', {
        fecha: form.fecha,
        proveedor: form.proveedor,
        nit_proveedor: form.nit_proveedor || null,
        numero_factura: form.numero_factura || null,
        descripcion: form.descripcion || null,
        monto: parseFloat(form.monto),
      })
      toast({ mensaje: 'Compra registrada', tipo: 'exito' })
      setForm({ fecha: new Date().toISOString().split('T')[0], proveedor: '', nit_proveedor: '', numero_factura: '', descripcion: '', monto: '' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Registrar compra">
      <div className="flex flex-col gap-4">
        <Input label="Fecha" type="date" value={form.fecha} onChange={set('fecha')} />
        <Input label="Proveedor" placeholder="Nombre del proveedor" value={form.proveedor} onChange={set('proveedor')} />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="NIT proveedor" placeholder="CF" value={form.nit_proveedor} onChange={set('nit_proveedor')} />
          </div>
          <div className="flex-1">
            <Input label="N° de factura" placeholder="000-00000" value={form.numero_factura} onChange={set('numero_factura')} />
          </div>
        </div>
        <Input label="Descripción" placeholder="Ej: Mercancía variada (opcional)" value={form.descripcion} onChange={set('descripcion')} />
        <Input label="Monto total (Q)" type="number" inputMode="decimal" placeholder="0.00" value={form.monto} onChange={set('monto')} />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function ModalEliminarCierre({ open, cierre, onClose, toast, onEliminar }) {
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => { if (!open) setPassword('') }, [open])

  const confirmar = async () => {
    if (!password) { toast({ mensaje: 'Ingresá tu contraseña', tipo: 'warning' }); return }
    setCargando(true)
    try {
      await api.delBody(`/api/cierres/${cierre.id}`, { password })
      toast({ mensaje: `Cierre del ${cierre.fecha} eliminado`, tipo: 'exito' })
      onEliminar()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Eliminar cierre de caja">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Vas a eliminar el cierre del <span className="font-semibold text-text">{cierre?.fecha}</span>.
          Esta acción no se puede deshacer.
        </p>
        <Input
          label="Confirmá tu contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button variant="danger" fullWidth onClick={confirmar} disabled={cargando}>
            {cargando ? 'Verificando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function TabVentas({ transacciones, chartData, top5, cargando, onEliminar, toast }) {
  const total = transacciones.reduce((s, t) => s + parseFloat(t.total), 0)

  const eliminar = async (id, numero) => {
    if (!confirm(`¿Eliminar venta #${numero}? Esta acción no se puede deshacer.`)) return
    try {
      await api.del(`/api/transacciones/${id}`)
      toast({ mensaje: `Venta #${numero} eliminada`, tipo: 'exito' })
      onEliminar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl px-5 py-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-primary" />
          <p className="text-sm text-muted font-medium">Ventas totales</p>
        </div>
        <p className="text-4xl font-bold tabular text-text">{cargando ? '...' : formatQ(total)}</p>
        <p className="text-xs text-muted mt-1">{transacciones.length} transacciones</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl px-4 pt-4 pb-2 mb-4">
        <p className="text-sm font-semibold text-muted mb-3">Ventas por día</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barSize={28}>
            <XAxis dataKey="dia" tick={{ fill: 'oklch(60% 0.008 250)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(28% 0.008 250)' }} />
            <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.esHoy ? 'oklch(72% 0.17 145)' : 'oklch(28% 0.008 250)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {top5.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
          <p className="text-sm font-semibold text-text mb-3">Top productos</p>
          {top5.map((p, i) => (
            <div key={p.nombre} className="flex items-center gap-3 py-3 border-t border-border-dim first:border-0">
              <span className="w-6 text-center text-sm font-bold text-muted tabular">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">{p.nombre}</p>
                <p className="text-xs text-muted">{p.ventas} unidades</p>
              </div>
              <span className="text-sm font-bold tabular text-text">{formatQ(p.total)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        <p className="text-sm font-semibold text-text mb-3">Transacciones</p>
        {transacciones.length === 0 && !cargando && (
          <p className="text-sm text-muted text-center py-4">Sin transacciones en este período</p>
        )}
        {transacciones.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
            <div>
              <p className="text-sm text-text font-medium">#{t.numero}</p>
              <p className="text-xs text-muted">{formatFecha(t.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-base font-bold tabular text-text">{formatQ(t.total)}</p>
                <Badge variant="muted">{t.metodo_pago}</Badge>
              </div>
              <button
                onClick={() => eliminar(t.id, t.numero)}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TabGastos({ gastos, cargando, onNuevo, onEliminar, toast }) {
  const total = gastos.reduce((s, g) => s + parseFloat(g.monto), 0)

  const eliminar = async (id, desc) => {
    if (!confirm(`¿Eliminar "${desc}"?`)) return
    try {
      await api.del(`/api/gastos/${id}`)
      toast({ mensaje: 'Gasto eliminado', tipo: 'exito' })
      onEliminar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex-1 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-danger" />
            <p className="text-sm text-muted font-medium">Total gastos</p>
          </div>
          <p className="text-3xl font-bold tabular text-text">{cargando ? '...' : formatQ(total)}</p>
        </div>
        <button
          onClick={onNuevo}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm whitespace-nowrap"
        >
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        {gastos.length === 0 && !cargando && (
          <p className="text-sm text-muted text-center py-4">Sin gastos en este período</p>
        )}
        {gastos.map((g) => (
          <div key={g.id} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium truncate">{g.descripcion}</p>
              <p className="text-xs text-muted">{g.fecha} · {g.categoria}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-base font-bold tabular text-danger">{formatQ(g.monto)}</p>
              <button
                onClick={() => eliminar(g.id, g.descripcion)}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function TabResumen({ transacciones, gastos, compras, cargando }) {
  const ingresos = transacciones.reduce((s, t) => s + parseFloat(t.total), 0)
  const egresos = gastos.reduce((s, g) => s + parseFloat(g.monto), 0)
  const totalCompras = compras.reduce((s, c) => s + parseFloat(c.monto), 0)
  const utilidad = ingresos - egresos - totalCompras

  const filas = [
    { label: 'Ingresos por ventas', monto: ingresos, color: 'text-primary', icono: TrendingUp },
    { label: 'Gastos operativos', monto: egresos, color: 'text-danger', icono: TrendingDown },
    { label: 'Compras a proveedores', monto: totalCompras, color: 'text-danger', icono: TrendingDown },
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl px-5 py-5 mb-4">
      <p className="text-sm font-semibold text-muted mb-4">Estado de resultados</p>
      {filas.map(({ label, monto, color, icono: Icono }) => (
        <div key={label} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
          <div className="flex items-center gap-2">
            <Icono size={15} className={color} />
            <p className="text-sm text-text">{label}</p>
          </div>
          <p className={`text-base font-bold tabular ${color}`}>{cargando ? '...' : formatQ(monto)}</p>
        </div>
      ))}
      <div className="flex items-center justify-between py-3 border-t-2 border-border mt-1">
        <div className="flex items-center gap-2">
          <Minus size={15} className={utilidad >= 0 ? 'text-primary' : 'text-danger'} />
          <p className="text-base font-bold text-text">Utilidad neta</p>
        </div>
        <p className={`text-xl font-bold tabular ${utilidad >= 0 ? 'text-primary' : 'text-danger'}`}>
          {cargando ? '...' : formatQ(utilidad)}
        </p>
      </div>
    </div>
  )
}

function TabCaja({ cierres, cargando, toast, onEliminar }) {
  const [pendienteEliminar, setPendienteEliminar] = useState(null)

  if (cargando) return <p className="text-sm text-muted text-center py-8">Cargando...</p>
  return (
    <>
      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        <p className="text-sm font-semibold text-text mb-3">Cierres de caja</p>
        {cierres.length === 0 && (
          <p className="text-sm text-muted text-center py-4">Sin cierres en este período</p>
        )}
        {cierres.map((c) => {
          const dif = Number(c.diferencia)
          const difColor = dif > 0 ? 'text-primary' : dif < 0 ? 'text-danger' : 'text-muted'
          return (
            <div key={c.id} className="py-4 border-t border-border-dim first:border-0">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-text">{c.fecha}</p>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold tabular ${difColor}`}>
                    {dif > 0 ? '+' : ''}{formatQ(dif)}
                  </span>
                  <button
                    onClick={() => setPendienteEliminar(c)}
                    className="w-8 h-8 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
                <span>Efectivo ventas: <span className="text-text font-medium tabular">{formatQ(c.ventas_efectivo)}</span></span>
                <span>Contado: <span className="text-text font-medium tabular">{formatQ(c.efectivo_contado)}</span></span>
                {Number(c.ventas_tarjeta) > 0 && <span>Tarjeta: <span className="text-text font-medium tabular">{formatQ(c.ventas_tarjeta)}</span></span>}
                {Number(c.ventas_transferencia) > 0 && <span>Transfer: <span className="text-text font-medium tabular">{formatQ(c.ventas_transferencia)}</span></span>}
                <span>Gastos: <span className="text-danger font-medium tabular">{formatQ(c.total_gastos)}</span></span>
                <span>Utilidad: <span className={`font-medium tabular ${(Number(c.total_ventas) - Number(c.total_gastos)) >= 0 ? 'text-primary' : 'text-danger'}`}>{formatQ(Number(c.total_ventas) - Number(c.total_gastos))}</span></span>
              </div>
              {c.notas && <p className="text-xs text-muted mt-2 italic">"{c.notas}"</p>}
            </div>
          )
        })}
      </div>
      <ModalEliminarCierre
        open={!!pendienteEliminar}
        cierre={pendienteEliminar}
        onClose={() => setPendienteEliminar(null)}
        toast={toast}
        onEliminar={() => { setPendienteEliminar(null); onEliminar() }}
      />
    </>
  )
}

function TabCompras({ compras, cargando, onNuevo, onEliminar, toast }) {
  const total = compras.reduce((s, c) => s + parseFloat(c.monto), 0)

  const eliminar = async (id, proveedor) => {
    if (!confirm(`¿Eliminar compra de "${proveedor}"?`)) return
    try {
      await api.del(`/api/compras/${id}`)
      toast({ mensaje: 'Compra eliminada', tipo: 'exito' })
      onEliminar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-surface border border-border rounded-2xl px-5 py-4 flex-1 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-muted" />
            <p className="text-sm text-muted font-medium">Total compras</p>
          </div>
          <p className="text-3xl font-bold tabular text-text">{cargando ? '...' : formatQ(total)}</p>
        </div>
        <button
          onClick={onNuevo}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm whitespace-nowrap"
        >
          <Plus size={18} /> Nueva
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
        {compras.length === 0 && !cargando && (
          <p className="text-sm text-muted text-center py-4">Sin compras en este período</p>
        )}
        {compras.map((c) => (
          <div key={c.id} className="flex items-start justify-between py-3 border-t border-border-dim first:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text font-medium truncate">{c.proveedor}</p>
              <p className="text-xs text-muted">
                {c.fecha}
                {c.numero_factura ? ` · Fact. ${c.serie_factura || ''}${c.numero_factura}` : ''}
                {c.nit_proveedor ? ` · NIT ${c.nit_proveedor}` : ''}
              </p>
              {c.descripcion && <p className="text-xs text-dim truncate mt-0.5">{c.descripcion}</p>}
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <p className="text-base font-bold tabular text-text">{formatQ(c.total)}</p>
              <button
                onClick={() => eliminar(c.id, c.proveedor)}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Reportes({ toast }) {
  const [rango, setRango] = useState('semana')
  const [tab, setTab] = useState('ventas')
  const [transacciones, setTransacciones] = useState([])
  const [gastos, setGastos] = useState([])
  const [cierres, setCierres] = useState([])
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalGasto, setModalGasto] = useState(false)
  const [modalCompra, setModalCompra] = useState(false)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const getRangoFechas = () => {
    const hasta = new Date()
    const desde = new Date()
    if (rango === 'hoy') {
      desde.setHours(0, 0, 0, 0)
    } else if (rango === 'semana') {
      desde.setDate(hasta.getDate() - 6)
      desde.setHours(0, 0, 0, 0)
    } else if (rango === 'mes') {
      desde.setDate(1)
      desde.setHours(0, 0, 0, 0)
    } else {
      return {
        desde: new Date(fechaDesde + 'T00:00:00').toISOString(),
        hasta: new Date(fechaHasta + 'T23:59:59').toISOString(),
      }
    }
    return { desde: desde.toISOString(), hasta: hasta.toISOString() }
  }

  const getLabelPeriodo = () => {
    if (rango === 'hoy') return 'Hoy'
    if (rango === 'semana') return 'Esta semana'
    if (rango === 'mes') return 'Este mes'
    return `${fechaDesde} al ${fechaHasta}`
  }

  const buildFilasLibro = () => {
    const filasIngresos = []
    for (const t of transacciones) {
      const items = t.items || []
      if (items.length === 0) {
        filasIngresos.push([t.created_at.split('T')[0], 'Ingreso', `Venta #${t.numero}`, t.metodo_pago, parseFloat(t.total)])
      } else {
        for (const item of items) {
          filasIngresos.push([
            t.created_at.split('T')[0],
            'Ingreso',
            item.cantidad > 1 ? `${item.nombre} (x${item.cantidad})` : item.nombre,
            t.metodo_pago,
            parseFloat(item.precio_unitario) * item.cantidad,
          ])
        }
      }
    }
    const filasEgresos = gastos.map((g) => [g.fecha, 'Egreso', g.descripcion, g.categoria || 'Otros', parseFloat(g.monto)])
    const filasCompras = compras.map((c) => [c.fecha, 'Compra', c.proveedor + (c.numero_factura ? ` — Fact. ${c.numero_factura}` : ''), c.nit_proveedor || 'CF', parseFloat(c.total)])
    return [...filasIngresos, ...filasEgresos, ...filasCompras].sort((a, b) => a[0].localeCompare(b[0]))
  }

  const exportarExcel = () => {
    const filas = []
    filas.push(['LIBRO DIARIO', '', '', '', ''])
    filas.push([`Período: ${getLabelPeriodo()}`, '', '', '', ''])
    filas.push([''])
    filas.push(['Fecha', 'Tipo', 'Descripción', 'Categoría / Método', 'Monto (Q)'])
    buildFilasLibro().forEach((f) => filas.push(f))
    const totalIngresos = transacciones.reduce((s, t) => s + parseFloat(t.total), 0)
    const totalEgresos = gastos.reduce((s, g) => s + parseFloat(g.monto), 0)
    const totalCompras = compras.reduce((s, c) => s + parseFloat(c.monto), 0)
    filas.push([''])
    filas.push(['', '', '', 'Total Ingresos', totalIngresos])
    filas.push(['', '', '', 'Total Egresos', totalEgresos])
    filas.push(['', '', '', 'Total Compras', totalCompras])
    filas.push(['', '', '', 'Utilidad Neta', totalIngresos - totalEgresos - totalCompras])
    const ws = XLSX.utils.aoa_to_sheet(filas)
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Libro Diario')
    XLSX.writeFile(wb, `libro_diario_${getLabelPeriodo().replace(/ /g, '_')}.xlsx`)
    toast({ mensaje: 'Excel descargado', tipo: 'exito' })
  }

  const exportarPDF = () => {
    const negocio = getNegocioConfig()
    const doc = new jsPDF()
    const totalIngresos = transacciones.reduce((s, t) => s + parseFloat(t.total), 0)
    const totalEgresos = gastos.reduce((s, g) => s + parseFloat(g.monto), 0)
    const totalCompras = compras.reduce((s, c) => s + parseFloat(c.monto), 0)
    const utilidad = totalIngresos - totalEgresos - totalCompras

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(negocio.nombre, 14, 20)
    doc.setFontSize(11)
    doc.text('LIBRO DIARIO', 14, 28)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (negocio.nit) doc.text(`NIT: ${negocio.nit}`, 14, 35)
    doc.text(`Período: ${getLabelPeriodo()}`, 14, 41)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-GT')}`, 14, 47)

    autoTable(doc, {
      startY: 54,
      head: [['Fecha', 'Tipo', 'Descripción', 'Categoría / Método', 'Monto (Q)']],
      body: buildFilasLibro().map((f) => [...f.slice(0, 4), `Q${f[4].toFixed(2)}`]),
      foot: [
        ['', '', '', 'Total Ingresos', `Q${totalIngresos.toFixed(2)}`],
        ['', '', '', 'Total Egresos', `Q${totalEgresos.toFixed(2)}`],
        ['', '', '', 'Total Compras', `Q${totalCompras.toFixed(2)}`],
        ['', '', '', 'Utilidad Neta', `Q${utilidad.toFixed(2)}`],
      ],
      headStyles: { fillColor: [30, 30, 40], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: 30, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      columnStyles: { 4: { halign: 'right' } },
    })

    doc.save(`libro_diario_${getLabelPeriodo().replace(/ /g, '_')}.pdf`)
    toast({ mensaje: 'PDF descargado', tipo: 'exito' })
  }

  const cargar = () => {
    if (rango === 'personalizado' && (!fechaDesde || !fechaHasta)) return
    const { desde, hasta } = getRangoFechas()
    setCargando(true)
    Promise.all([
      api.get(`/api/transacciones?desde=${desde}&hasta=${hasta}`),
      api.get(`/api/gastos?desde=${desde}&hasta=${hasta}`),
      api.get(`/api/cierres?desde=${desde}&hasta=${hasta}`),
      api.get(`/api/compras?desde=${desde}&hasta=${hasta}`),
    ])
      .then(([t, g, c, co]) => { setTransacciones(t); setGastos(g); setCierres(c); setCompras(co) })
      .catch(() => toast({ mensaje: 'Error al cargar reportes', tipo: 'error' }))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    if (rango !== 'personalizado') cargar()
  }, [rango])

  const chartData = buildChartData(transacciones, rango)
  const top5 = buildTop5(transacciones)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text">Reportes</h1>
        <div className="flex gap-2">
          <button onClick={exportarPDF}
            className="flex items-center gap-1.5 bg-surface-2 border border-border text-text px-3 rounded-xl font-medium min-h-touch active-scale text-sm">
            <FileText size={15} /> PDF
          </button>
          <button onClick={exportarExcel}
            className="flex items-center gap-1.5 bg-surface-2 border border-border text-text px-3 rounded-xl font-medium min-h-touch active-scale text-sm">
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {[['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['personalizado', 'Personalizado']].map(([id, label]) => (
          <button key={id} onClick={() => setRango(id)}
            className={['px-4 py-2 rounded-xl text-sm font-medium border transition-colors duration-base active-scale',
              rango === id ? 'bg-primary text-primary-fg border-primary' : 'bg-surface-2 text-muted border-border'].join(' ')}>
            {label}
          </button>
        ))}
      </div>

      {rango === 'personalizado' && (
        <div className="flex gap-2 mb-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-3 text-sm text-text outline-none focus:border-primary" />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-3 text-sm text-text outline-none focus:border-primary" />
          </div>
          <button onClick={cargar} disabled={!fechaDesde || !fechaHasta}
            className="px-4 min-h-touch rounded-xl bg-primary text-primary-fg text-sm font-semibold active-scale disabled:opacity-40">
            Ver
          </button>
        </div>
      )}

      <div className="flex gap-1 bg-surface-2 rounded-xl p-1 mb-5">
        {[['ventas', 'Ventas'], ['gastos', 'Gastos'], ['compras', 'Compras'], ['resumen', 'Resumen'], ['caja', 'Caja']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={['flex-1 py-2 rounded-lg text-xs font-medium transition-colors active-scale',
              tab === id ? 'bg-surface text-text shadow-sm' : 'text-muted'].join(' ')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'ventas' && (
        <TabVentas transacciones={transacciones} chartData={chartData} top5={top5} cargando={cargando} onEliminar={cargar} toast={toast} />
      )}
      {tab === 'gastos' && (
        <TabGastos gastos={gastos} cargando={cargando} onNuevo={() => setModalGasto(true)} onEliminar={cargar} toast={toast} />
      )}
      {tab === 'compras' && (
        <TabCompras compras={compras} cargando={cargando} onNuevo={() => setModalCompra(true)} onEliminar={cargar} toast={toast} />
      )}
      {tab === 'resumen' && (
        <TabResumen transacciones={transacciones} gastos={gastos} compras={compras} cargando={cargando} />
      )}
      {tab === 'caja' && (
        <TabCaja cierres={cierres} cargando={cargando} toast={toast} onEliminar={cargar} />
      )}

      <ModalGasto open={modalGasto} onClose={() => setModalGasto(false)} toast={toast} onGuardado={cargar} />
      <ModalCompra open={modalCompra} onClose={() => setModalCompra(false)} toast={toast} onGuardado={cargar} />
    </div>
  )
}
