import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useStore } from '../store/useStore'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login({ toast }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const login = useStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast({ mensaje: 'Ingresá tu usuario y contraseña', tipo: 'warning' })
      return
    }
    setCargando(true)
    try {
      await login(username, password)
      navigate('/pos')
    } catch (err) {
      toast({ mensaje: err.message || 'Usuario o contraseña incorrectos', tipo: 'error' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <ShoppingCart size={32} className="text-primary-fg" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-text">POS Retail</h1>
          <p className="text-muted text-sm mt-1">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Usuario"
            id="username"
            type="text"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Contraseña"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth disabled={cargando} className="mt-2">
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
