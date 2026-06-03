import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useToast } from './hooks/useToast'
import ToastContainer from './components/Toast'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Config from './pages/Config'

function Spinner() {
  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function RutaProtegida({ children }) {
  const usuario = useStore((s) => s.usuario)
  return usuario ? children : <Navigate to="/login" replace />
}

function SoloAdmin({ children }) {
  const usuario = useStore((s) => s.usuario)
  return usuario?.rol === 'ADMIN' ? children : <Navigate to="/pos" replace />
}

export default function App() {
  const { toasts, toast, removeToast } = useToast()
  const verificarSesion = useStore((s) => s.verificarSesion)
  const cargandoAuth = useStore((s) => s.cargandoAuth)

  useEffect(() => {
    verificarSesion()
  }, [])

  if (cargandoAuth) return <Spinner />

  const toastContainer = <ToastContainer toasts={toasts} onRemove={removeToast} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login toast={toast} />} />

        <Route
          element={
            <RutaProtegida>
              <AppLayout toastContainer={toastContainer} />
            </RutaProtegida>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS toast={toast} />} />
          <Route path="/productos" element={<Productos toast={toast} />} />
          <Route path="/inventario" element={<Inventario toast={toast} />} />
          <Route path="/reportes" element={<Reportes toast={toast} />} />
          <Route path="/config" element={<Config toast={toast} />} />
          <Route
            path="/usuarios"
            element={
              <SoloAdmin>
                <Usuarios toast={toast} />
              </SoloAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/pos" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
