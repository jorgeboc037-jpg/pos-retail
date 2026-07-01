import { useState, useEffect } from 'react'
import { Hammer, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../../services/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function ModalArmarArreglo({ producto, onClose, toast, onArmado }) {
  const [receta, setReceta] = useState([])
  const [cantidad, setCantidad] = useState('1')
  const [cargando, setCargando] = useState(false)
  const [armando, setArmando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    if (!producto) { setReceta([]); setCantidad('1'); setResultado(null); return }
    setCargando(true)
    api.get(`/api/productos/${producto.id}/componentes`)
      .then(setReceta)
      .catch(() => toast({ mensaje: 'Error al cargar la receta', tipo: 'error' }))
      .finally(() => setCargando(false))
  }, [producto])

  const cant = parseInt(cantidad) || 0
  const preview = receta.map((r) => ({
    nombre: r.productos?.nombre,
    stock_actual: r.productos?.stock ?? 0,
    necesario: r.cantidad * cant,
  }))
  const hayInsuficientes = preview.some((p) => p.necesario > p.stock_actual)

  const armar = async () => {
    if (cant < 1) {
      toast({ mensaje: 'Ingresá la cantidad a armar', tipo: 'warning' }); return
    }
    setArmando(true)
    setResultado(null)
    try {
      const data = await api.post('/api/armar', { producto_id: producto.id, cantidad: cant })
      if (data.componentes_fallidos?.length > 0 || !data.arreglo_ok) {
        setResultado(data)
        return
      }
      if (!data.costo_actualizado) {
        toast({ mensaje: 'Armado exitoso, pero no se pudo actualizar el costo promedio', tipo: 'warning' })
      } else {
        toast({ mensaje: `${cant} unidad(es) de "${producto.nombre}" armadas`, tipo: 'exito' })
      }
      onArmado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setArmando(false)
    }
  }

  return (
    <Modal open={!!producto} onClose={onClose} titulo={`Armar — ${producto?.nombre || ''}`}>
      <div className="flex flex-col gap-4">
        {resultado ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-danger">
              <AlertTriangle size={16} />
              <span className="font-medium">Armado incompleto — revisá manualmente</span>
            </div>
            {resultado.componentes_ok?.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-1">Componentes descontados correctamente:</p>
                {resultado.componentes_ok.map((c) => (
                  <p key={c.componente_id} className="text-sm text-text flex items-center gap-1">
                    <CheckCircle size={12} className="text-primary" /> {c.nombre}
                  </p>
                ))}
              </div>
            )}
            {resultado.componentes_fallidos?.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-1">No se pudieron descontar:</p>
                {resultado.componentes_fallidos.map((c) => (
                  <p key={c.componente_id} className="text-sm text-danger">{c.nombre} — {c.error}</p>
                ))}
              </div>
            )}
            {resultado.arreglo_error && (
              <p className="text-sm text-danger">El arreglo no se pudo incrementar: {resultado.arreglo_error}</p>
            )}
            <p className="text-xs text-dim">Usá la pestaña Ajustes para compensar manualmente los componentes ya descontados si fuera necesario.</p>
            <Button fullWidth onClick={onClose}>Entendido</Button>
          </div>
        ) : (
          <>
            {cargando && <p className="text-sm text-muted text-center py-4">Cargando receta...</p>}

            {!cargando && receta.length === 0 && (
              <p className="text-sm text-muted text-center py-4">Este arreglo no tiene componentes configurados. Agrégalos primero desde "Editar" → "Gestionar componentes".</p>
            )}

            {!cargando && receta.length > 0 && (
              <>
                <Input label="Cantidad a armar" type="number" inputMode="numeric" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted">Componentes necesarios</p>
                  {preview.map((p, i) => (
                    <div key={i} className={`flex justify-between items-center rounded-xl px-4 py-2 ${p.necesario > p.stock_actual ? 'bg-danger/10' : 'bg-surface-2'}`}>
                      <span className="text-sm text-text">{p.nombre}</span>
                      <span className={`text-sm font-bold tabular ${p.necesario > p.stock_actual ? 'text-danger' : 'text-text'}`}>
                        {p.necesario} / {p.stock_actual} und.
                      </span>
                    </div>
                  ))}
                </div>

                {hayInsuficientes && (
                  <div className="flex items-center gap-2 text-sm text-danger">
                    <AlertTriangle size={14} />
                    <span>Stock insuficiente en uno o más componentes</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
                  <Button fullWidth onClick={armar} disabled={armando || hayInsuficientes || cant < 1}>
                    {armando ? 'Armando...' : <><Hammer size={16} /> Armar</>}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}
