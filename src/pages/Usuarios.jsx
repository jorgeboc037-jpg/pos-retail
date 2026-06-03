import { useState, useEffect } from 'react'
import { Plus, UserCircle, ShieldCheck, ShoppingCart, KeyRound } from 'lucide-react'
import { api } from '../services/api'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const rolIcono = { ADMIN: ShieldCheck, CAJERO: ShoppingCart }
const rolColor = { ADMIN: 'primary', CAJERO: 'warning' }

function ModalUsuario({ open, onClose, toast, onGuardado }) {
  const [form, setForm] = useState({ nombre: '', username: '', password: '', rol: 'CAJERO' })
  const [cargando, setCargando] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    if (!form.nombre || !form.username || !form.password) {
      toast({ mensaje: 'Nombre, usuario y contraseña son requeridos', tipo: 'warning' })
      return
    }
    setCargando(true)
    try {
      await api.post('/api/usuarios', form)
      toast({ mensaje: `Usuario "${form.nombre}" creado`, tipo: 'exito' })
      setForm({ nombre: '', username: '', password: '', rol: 'CAJERO' })
      onGuardado()
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo="Nuevo usuario">
      <div className="flex flex-col gap-4">
        <Input label="Nombre completo" placeholder="Ej: María García" value={form.nombre} onChange={set('nombre')} />
        <Input label="Usuario" placeholder="Ej: ventas1" value={form.username} onChange={set('username')} autoComplete="off" />
        <Input label="Contraseña" type="password" placeholder="Mínimo 4 caracteres" value={form.password} onChange={set('password')} autoComplete="new-password" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted">Rol</label>
          <select value={form.rol} onChange={set('rol')}
            className="w-full min-h-touch rounded-xl bg-surface-2 border border-border px-4 text-base text-text outline-none focus:border-primary">
            <option value="CAJERO">Cajero</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Agregar'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function ModalResetPassword({ open, onClose, toast, usuario }) {
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  const guardar = async () => {
    if (!password || password.length < 4) {
      toast({ mensaje: 'Mínimo 4 caracteres', tipo: 'warning' }); return
    }
    setCargando(true)
    try {
      await api.put(`/api/usuarios/${usuario.id}`, { password })
      toast({ mensaje: `Contraseña de ${usuario.nombre} actualizada`, tipo: 'exito' })
      setPassword('')
      onClose()
    } catch (err) {
      toast({ mensaje: err.message, tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} titulo={`Restablecer contraseña`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">Nueva contraseña para <span className="text-text font-medium">{usuario?.nombre}</span></p>
        <Input label="Nueva contraseña" type="password" placeholder="Mínimo 4 caracteres" value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button fullWidth onClick={guardar} disabled={cargando}>{cargando ? 'Guardando...' : 'Restablecer'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Usuarios({ toast }) {
  const [modal, setModal] = useState(false)
  const [modalReset, setModalReset] = useState(null)
  const [usuarios, setUsuarios] = useState([])

  const cargarUsuarios = () => {
    api.get('/api/usuarios')
      .then(setUsuarios)
      .catch(() => toast({ mensaje: 'Error al cargar usuarios', tipo: 'error' }))
  }

  useEffect(() => { cargarUsuarios() }, [])

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text">Usuarios</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-fg px-4 rounded-xl font-semibold min-h-touch active-scale text-sm">
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {usuarios.map((u) => {
          const Icono = rolIcono[u.rol] || UserCircle
          return (
            <div key={u.id} className="bg-surface border border-border rounded-xl px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                  <Icono size={20} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text truncate">{u.nombre}</p>
                  <p className="text-xs text-muted font-mono truncate">@{u.username}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={rolColor[u.rol] || 'muted'}>{u.rol}</Badge>
                    <Badge variant={u.activo ? 'primary' : 'muted'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </div>
                  <button onClick={() => setModalReset(u)}
                    className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center active-scale text-muted ml-1"
                    title="Restablecer contraseña">
                    <KeyRound size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ModalUsuario open={modal} onClose={() => setModal(false)} toast={toast} onGuardado={cargarUsuarios} />
      {modalReset && (
        <ModalResetPassword
          open={!!modalReset}
          onClose={() => setModalReset(null)}
          toast={toast}
          usuario={modalReset}
        />
      )}
    </div>
  )
}
