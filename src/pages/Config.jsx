import { useNavigate } from 'react-router-dom'
import { LogOut, Users, Boxes, HelpCircle, ChevronRight, Store } from 'lucide-react'
import { useStore } from '../store/useStore'

const items = [
  { icono: Store, label: 'Información del negocio', sub: 'Nombre, dirección, NIT' },
  { icono: Users, label: 'Usuarios', sub: 'Gestionar accesos y roles', to: '/usuarios' },
  { icono: Boxes, label: 'Inventario', sub: 'Ver entradas y salidas', to: '/inventario' },
  { icono: HelpCircle, label: 'Ayuda', sub: 'Manual de uso' },
]

export default function Config({ toast }) {
  const usuario = useStore((s) => s.usuario)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()

  const cerrarSesion = () => {
    logout()
    navigate('/login')
    toast({ mensaje: 'Sesión cerrada', tipo: 'info' })
  }

  return (
    <div className="px-4 pt-6">
      <h1 className="text-2xl font-bold text-text mb-5">Configuración</h1>

      {/* Perfil */}
      <div className="bg-surface border border-border rounded-2xl px-4 py-4 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {usuario?.nombre?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-text">{usuario?.nombre}</p>
          <p className="text-xs text-muted">{usuario?.email}</p>
        </div>
      </div>

      {/* Opciones */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
        {items.map(({ icono: Icono, label, sub, to }, i) => (
          <button
            key={label}
            className={[
              'w-full flex items-center gap-4 px-4 py-4 text-left active-scale',
              i > 0 ? 'border-t border-border-dim' : '',
            ].join(' ')}
            onClick={() => to ? navigate(to) : toast({ mensaje: `${label} (próximamente)`, tipo: 'info' })}
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
              <Icono size={18} className="text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{label}</p>
              <p className="text-xs text-muted">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-dim shrink-0" />
          </button>
        ))}
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={cerrarSesion}
        className="w-full flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-2xl text-left active-scale"
      >
        <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
          <LogOut size={18} className="text-danger" />
        </div>
        <span className="text-sm font-medium text-danger">Cerrar sesión</span>
      </button>

      <p className="text-center text-xs text-dim mt-8 pb-4">POS Retail v1.0 — Fase 1 (demo)</p>
    </div>
  )
}
