import { NavLink } from 'react-router-dom'
import { ShoppingCart, Package, ShoppingBag, BarChart2, Settings } from 'lucide-react'
import { useStore } from '../../store/useStore'

const ITEMS_ADMIN = [
  { to: '/pos',        icono: ShoppingCart, label: 'POS' },
  { to: '/inventario', icono: Package,      label: 'Inventario' },
  { to: '/compras',    icono: ShoppingBag,  label: 'Compras' },
  { to: '/reportes',   icono: BarChart2,    label: 'Reportes' },
  { to: '/config',     icono: Settings,     label: 'Config' },
]

const ITEMS_CAJERO = [
  { to: '/pos', icono: ShoppingCart, label: 'POS' },
]

export default function BottomNav() {
  const usuario = useStore((s) => s.usuario)
  const items = usuario?.rol === 'ADMIN' ? ITEMS_ADMIN : ITEMS_CAJERO

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-safe">
      <div className="flex items-stretch">
        {items.map(({ to, icono: Icono, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-nav text-xs font-medium transition-colors duration-base ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icono size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
