import { useState, useEffect } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { api } from '../../services/api'
import Modal from '../ui/Modal'

function BuscadorComponente({ onSeleccionar }) {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState([])

  useEffect(() => {
    if (!q.trim()) { setResultados([]); return }
    const t = setTimeout(() => {
      api.get(`/api/productos/buscar?q=${encodeURIComponent(q)}`)
        .then((data) => setResultados(data.filter((p) => !p.es_compuesto)))
        .catch(() => {})
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
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Buscar producto a agregar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full min-h-touch rounded-xl bg-surface-2 border border-border pl-9 pr-4 text-sm text-text placeholder:text-dim outline-none focus:border-primary"
        />
      </div>
      {resultados.length > 0 && (
        <div className="flex flex-col gap-1">
          {resultados.map((p) => (
            <button key={p.id} onClick={() => seleccionar(p)}
              className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-xl border border-border active-scale text-left">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text truncate">{p.nombre}</p>
                <p className="text-xs text-muted">{p.sku} · Stock: {p.stock}</p>
              </div>
              <ChevronRight size={16} className="text-dim shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}
      {q.trim() && resultados.length === 0 && (
        <p className="text-xs text-muted text-center py-2">Sin resultados</p>
      )}
    </div>
  )
}

export default function ModalGestionarComponentes({ producto, open, onClose, toast }) {
  const [componentes, setComponentes] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargar = () => {
    if (!producto) return
    setCargando(true)
    api.get(`/api/productos/${producto.id}/componentes`)
      .then(setComponentes)
      .catch(() => toast({ mensaje: 'Error al cargar componentes', tipo: 'error' }))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    if (open) cargar()
    else setComponentes([])
  }, [open, producto])

  const agregar = async (p) => {
    try {
      await api.post(`/api/productos/${producto.id}/componentes`, { componente_id: p.id, cantidad: 1 })
      cargar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  const actualizarCantidad = async (row, cantidad) => {
    if (!cantidad || parseInt(cantidad) < 1) return
    try {
      await api.del(`/api/productos/${producto.id}/componentes/${row.id}`)
      await api.post(`/api/productos/${producto.id}/componentes`, { componente_id: row.componente_id, cantidad: parseInt(cantidad) })
      cargar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  const quitar = async (row) => {
    try {
      await api.del(`/api/productos/${producto.id}/componentes/${row.id}`)
      cargar()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo={`Componentes — ${producto?.nombre || ''}`}>
      <div className="flex flex-col gap-4">
        <BuscadorComponente onSeleccionar={agregar} />

        {cargando && <p className="text-sm text-muted text-center py-4">Cargando...</p>}

        {!cargando && componentes.length === 0 && (
          <p className="text-sm text-muted text-center py-4">Este arreglo no tiene componentes todavía</p>
        )}

        {!cargando && componentes.length > 0 && (
          <div className="flex flex-col gap-2">
            {componentes.map((row) => (
              <div key={row.id} className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{row.productos?.nombre}</p>
                  <p className="text-xs text-muted">Stock disponible: {row.productos?.stock}</p>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  defaultValue={row.cantidad}
                  onBlur={(e) => actualizarCantidad(row, e.target.value)}
                  className="w-16 h-9 rounded-lg bg-surface border border-border px-2 text-sm text-text text-center outline-none focus:border-primary"
                />
                <button onClick={() => quitar(row)} className="ml-2 text-danger active-scale">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
