import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, ChevronRight, Store, Lock, Eye, EyeOff, Calculator } from 'lucide-react'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { formatQ } from '../data/dummy'

const CONFIG_KEY = 'pos_negocio'

function getConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY)) || { nombre: 'Detalles Kairos', nit: '30451469' }
  } catch {
    return { nombre: 'Detalles Kairos', nit: '30451469' }
  }
}

export function getNegocioConfig() {
  return getConfig()
}

function ModalNegocio({ open, onClose, toast }) {
  const inicial = getConfig()
  const [form, setForm] = useState(inicial)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = () => {
    if (!form.nombre) { toast({ mensaje: 'El nombre es requerido', tipo: 'warning' }); return }
    localStorage.setItem(CONFIG_KEY, JSON.stringify(form))
    toast({ mensaje: 'Información guardada', tipo: 'exito' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Información del negocio">
      <div className="flex flex-col gap-4">
        <Input label="Nombre del negocio" placeholder="Ej: Detalles Kairos" value={form.nombre} onChange={set('nombre')} />
        <Input label="NIT" placeholder="Ej: 30451469" value={form.nit} onChange={set('nit')} />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}

function ModalCierreCaja({ open, onClose, toast }) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [contado, setContado] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!open) { setDatos(null); setContado(''); setNotas(''); return }
    setCargando(true)
    api.get('/api/cierres/hoy')
      .then(setDatos)
      .catch(() => toast({ mensaje: 'Error al cargar datos del día', tipo: 'error' }))
      .finally(() => setCargando(false))
  }, [open])

  const guardar = async () => {
    if (contado === '') { toast({ mensaje: 'Ingresá el efectivo contado', tipo: 'warning' }); return }
    setGuardando(true)
    try {
      const result = await api.post('/api/cierres', {
        efectivo_contado: parseFloat(contado),
        notas: notas || null,
      })
      toast({ mensaje: 'Caja cerrada correctamente', tipo: 'exito' })
      setDatos((d) => ({ ...d, cierre: result }))
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  const preview = datos?.preview
  const cierre = datos?.cierre
  const diferencia = preview && contado !== '' ? parseFloat(contado || 0) - preview.ventas_efectivo : null
  const difColor = diferencia === null ? '' : diferencia > 0 ? 'text-primary' : diferencia < 0 ? 'text-danger' : 'text-muted'

  return (
    <Modal open={open} onClose={onClose} titulo={cierre ? 'Caja cerrada' : 'Cerrar Caja'}>
      {cargando && <p className="text-sm text-muted text-center py-6">Cargando...</p>}
      {!cargando && datos && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted font-mono">{preview?.fecha}</p>

          <div className="bg-surface-2 rounded-xl px-4 py-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted mb-1">Ventas del día</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Efectivo</span>
              <span className="font-semibold tabular text-text">{formatQ(preview.ventas_efectivo)}</span>
            </div>
            {preview.ventas_tarjeta > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Tarjeta</span>
                <span className="font-semibold tabular text-text">{formatQ(preview.ventas_tarjeta)}</span>
              </div>
            )}
            {preview.ventas_transferencia > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted">Transferencia</span>
                <span className="font-semibold tabular text-text">{formatQ(preview.ventas_transferencia)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
              <span className="text-text font-medium">Total ventas</span>
              <span className="font-bold tabular text-text">{formatQ(preview.total_ventas)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Gastos del día</span>
              <span className="font-semibold tabular text-danger">- {formatQ(preview.total_gastos)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-1">
              <span className="text-text font-medium">Utilidad neta</span>
              <span className={`font-bold tabular ${(preview.total_ventas - preview.total_gastos) >= 0 ? 'text-primary' : 'text-danger'}`}>
                {formatQ(preview.total_ventas - preview.total_gastos)}
              </span>
            </div>
          </div>

          {cierre ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Efectivo contado</span>
                <span className="font-semibold tabular text-text">{formatQ(cierre.efectivo_contado)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Diferencia</span>
                <span className={`font-bold tabular ${cierre.diferencia > 0 ? 'text-primary' : cierre.diferencia < 0 ? 'text-danger' : 'text-muted'}`}>
                  {cierre.diferencia > 0 ? '+' : ''}{formatQ(cierre.diferencia)}
                </span>
              </div>
              {cierre.notas && <p className="text-xs text-muted italic">{cierre.notas}</p>}
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-4 py-3">
                <span className="text-primary text-sm font-medium">✓ Caja cerrada correctamente</span>
              </div>
              <Button variant="ghost" fullWidth onClick={onClose}>Cerrar</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input
                label="Efectivo contado (Q)"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={contado}
                onChange={(e) => setContado(e.target.value)}
              />

              {diferencia !== null && (
                <div className="flex justify-between items-center bg-surface-2 rounded-xl px-4 py-3">
                  <span className="text-sm text-muted">Diferencia</span>
                  <span className={`text-base font-bold tabular ${difColor}`}>
                    {diferencia > 0 ? '+' : ''}{formatQ(diferencia)}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Notas (opcional)</label>
                <textarea
                  placeholder="Ej: Se encontraron Q5 de más..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
                <Button fullWidth onClick={guardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Cerrar Caja'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function ModalPassword({ open, onClose, toast }) {
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [mostrar, setMostrar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    if (!form.actual || !form.nueva || !form.confirmar) {
      toast({ mensaje: 'Completá todos los campos', tipo: 'warning' }); return
    }
    if (form.nueva !== form.confirmar) {
      toast({ mensaje: 'Las contraseñas nuevas no coinciden', tipo: 'warning' }); return
    }
    if (form.nueva.length < 4) {
      toast({ mensaje: 'La contraseña debe tener al menos 4 caracteres', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      await api.put('/api/auth/password', { passwordActual: form.actual, passwordNueva: form.nueva })
      toast({ mensaje: 'Contraseña actualizada', tipo: 'exito' })
      setForm({ actual: '', nueva: '', confirmar: '' })
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  const tipo = mostrar ? 'text' : 'password'

  return (
    <Modal open={open} onClose={onClose} titulo="Cambiar contraseña">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input label="Contraseña actual" type={tipo} value={form.actual} onChange={set('actual')} autoComplete="current-password" />
        </div>
        <Input label="Contraseña nueva" type={tipo} value={form.nueva} onChange={set('nueva')} autoComplete="new-password" />
        <Input label="Confirmar contraseña nueva" type={tipo} value={form.confirmar} onChange={set('confirmar')} autoComplete="new-password" />
        <button
          onClick={() => setMostrar((v) => !v)}
          className="flex items-center gap-2 text-xs text-muted self-start active-scale"
        >
          {mostrar ? <EyeOff size={14} /> : <Eye size={14} />}
          {mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
        </button>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Config({ toast }) {
  const usuario = useStore((s) => s.usuario)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()
  const [modalNegocio, setModalNegocio] = useState(false)
  const [modalPassword, setModalPassword] = useState(false)
  const [modalCierre, setModalCierre] = useState(false)
  const config = getConfig()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
    toast({ mensaje: 'Sesión cerrada', tipo: 'info' })
  }

  const opciones = [
    {
      icono: Calculator,
      label: 'Cerrar Caja',
      sub: 'Registro de fin de día',
      onClick: () => setModalCierre(true),
    },
    {
      icono: Store,
      label: 'Información del negocio',
      sub: config.nombre,
      onClick: () => setModalNegocio(true),
    },
    {
      icono: Lock,
      label: 'Cambiar contraseña',
      sub: 'Actualizá tu contraseña de acceso',
      onClick: () => setModalPassword(true),
    },
    {
      icono: Users,
      label: 'Usuarios',
      sub: 'Gestionar accesos y roles',
      onClick: () => navigate('/usuarios'),
    },
  ]

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-text mb-5">Configuración</h1>

      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {usuario?.nombre?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-text">{usuario?.nombre}</p>
          <p className="text-xs text-muted capitalize">{usuario?.rol?.toLowerCase()}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
        {opciones.map(({ icono: Icono, label, sub, onClick }, i) => (
          <button
            key={label}
            className={['w-full flex items-center gap-4 px-4 py-4 text-left active-scale',
              i > 0 ? 'border-t border-border-dim' : ''].join(' ')}
            onClick={onClick}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
              <Icono size={18} className="text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{label}</p>
              <p className="text-xs text-muted truncate">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-dim shrink-0" />
          </button>
        ))}
      </div>

      <button
        onClick={cerrarSesion}
        className="w-full flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-2xl text-left active-scale"
      >
        <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
          <LogOut size={18} className="text-danger" />
        </div>
        <span className="text-sm font-medium text-danger">Cerrar sesión</span>
      </button>

      <p className="text-center text-xs text-dim mt-8 pb-4">POS Retail v1.0 — Detalles Kairos</p>

      <ModalCierreCaja open={modalCierre} onClose={() => setModalCierre(false)} toast={toast} />
      <ModalNegocio open={modalNegocio} onClose={() => setModalNegocio(false)} toast={toast} />
      <ModalPassword open={modalPassword} onClose={() => setModalPassword(false)} toast={toast} />
    </div>
  )
}
