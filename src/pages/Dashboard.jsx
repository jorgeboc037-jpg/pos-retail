import { useNavigate } from 'react-router-dom'
import { TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '../store/useStore'
import { TRANSACCIONES, VENTAS_7_DIAS, PRODUCTOS, formatQ, formatFecha } from '../data/dummy'
import Badge from '../components/ui/Badge'

const stockBajo = PRODUCTOS.filter((p) => p.stock > 0 && p.stock <= 5)
const totalHoy = TRANSACCIONES.reduce((s, t) => s + t.total, 0)

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

export default function Dashboard() {
  const usuario = useStore((s) => s.usuario)
  const navigate = useNavigate()
  const hoy = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Encabezado */}
      <div className="mb-6">
        <p className="text-muted text-sm capitalize">{hoy}</p>
        <h1 className="text-2xl font-bold text-text mt-0.5">
          Hola, {usuario?.nombre?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Venta del día */}
      <div
        className="bg-primary rounded-2xl px-5 py-5 mb-4 active-scale cursor-pointer"
        onClick={() => navigate('/reportes')}
        role="button"
        aria-label="Ver reportes"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-primary-fg/70" />
          <p className="text-primary-fg/70 text-sm font-medium">Ventas de hoy</p>
        </div>
        <p className="text-4xl font-bold text-primary-fg tabular">{formatQ(totalHoy)}</p>
        <p className="text-primary-fg/60 text-sm mt-1">{TRANSACCIONES.length} transacciones</p>
      </div>

      {/* Gráfico 7 días */}
      <div className="bg-surface border border-border rounded-2xl px-4 pt-4 pb-2 mb-4">
        <p className="text-sm font-semibold text-muted mb-3">Últimos 7 días</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={VENTAS_7_DIAS} barSize={28}>
            <XAxis dataKey="dia" tick={{ fill: 'oklch(60% 0.008 250)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(28% 0.008 250)' }} />
            <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
              {VENTAS_7_DIAS.map((entry, i) => (
                <Cell
                  key={i}
                  fill={i === VENTAS_7_DIAS.length - 1 ? 'oklch(72% 0.17 145)' : 'oklch(28% 0.008 250)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <p className="text-sm font-semibold text-text">Stock bajo</p>
            <Badge variant="warning" className="ml-auto">{stockBajo.length} productos</Badge>
          </div>
          <div className="flex flex-col gap-1">
            {stockBajo.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-t border-border-dim first:border-0">
                <span className="text-sm text-text">{p.nombre}</span>
                <span className="text-sm tabular text-warning font-semibold">{p.stock} und.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimas transacciones */}
      <div className="bg-surface border border-border rounded-2xl px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted" />
            <p className="text-sm font-semibold text-text">Últimas ventas</p>
          </div>
          <button
            className="flex items-center gap-1 text-xs text-primary active-scale"
            onClick={() => navigate('/reportes')}
          >
            Ver todo <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col">
          {TRANSACCIONES.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-t border-border-dim first:border-0">
              <div>
                <p className="text-sm text-text font-medium">#{t.id}</p>
                <p className="text-xs text-muted">{formatFecha(t.fecha)} · {t.metodo}</p>
              </div>
              <span className="text-base font-bold tabular text-text">{formatQ(t.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
