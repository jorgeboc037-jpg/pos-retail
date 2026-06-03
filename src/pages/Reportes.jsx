import { useState, useEffect } from 'react'
import { Download, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { api } from '../services/api'
import { formatQ, formatFecha } from '../data/dummy'
import Badge from '../components/ui/Badge'

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

export default function Reportes({ toast }) {
  const [rango, setRango] = useState('semana')
  const [transacciones, setTransacciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const ahora = new Date()
    const inicio = new Date()
    if (rango === 'semana') {
      inicio.setDate(ahora.getDate() - 6)
    } else {
      inicio.setDate(1)
    }
    inicio.setHours(0, 0, 0, 0)

    setCargando(true)
    api.get(`/api/transacciones?desde=${inicio.toISOString()}&hasta=${ahora.toISOString()}`)
      .then(setTransacciones)
      .catch(() => toast({ mensaje: 'Error al cargar reportes', tipo: 'error' }))
      .finally(() => setCargando(false))
  }, [rango])

  const total = transacciones.reduce((s, t) => s + parseFloat(t.total), 0)
  const chartData = buildChartData(transacciones, rango)
  const top5 = buildTop5(transacciones)

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text">Reportes</h1>
        <button
          onClick={() => toast({ mensaje: 'PDF generado (próximamente)', tipo: 'info' })}
          className="flex items-center gap-2 bg-surface-2 border border-border text-text px-4 rounded-xl font-medium min-h-touch active-scale text-sm"
        >
          <Download size={16} /> Exportar
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {['semana', 'mes'].map((r) => (
          <button
            key={r}
            onClick={() => setRango(r)}
            className={[
              'px-4 py-2 rounded-xl text-sm font-medium border transition-colors duration-base active-scale capitalize',
              rango === r ? 'bg-primary text-primary-fg border-primary' : 'bg-surface-2 text-muted border-border',
            ].join(' ')}
          >
            Esta {r}
          </button>
        ))}
      </div>

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
            <div className="text-right">
              <p className="text-base font-bold tabular text-text">{formatQ(t.total)}</p>
              <Badge variant="muted">{t.metodo_pago}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
