import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, Boxes, ChevronRight, Store, Lock, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

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
  const config = getConfig()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
    toast({ mensaje: 'Sesión cerrada', tipo: 'info' })
  }

  const opciones = [
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
    {
      icono: Boxes,
      label: 'Inventario',
      sub: 'Ver entradas y salidas',
      onClick: () => navigate('/inventario'),
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

      <ModalNegocio open={modalNegocio} onClose={() => setModalNegocio(false)} toast={toast} />
      <ModalPassword open={modalPassword} onClose={() => setModalPassword(false)} toast={toast} />
    </div>
  )
}
