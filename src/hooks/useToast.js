import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ mensaje, tipo = 'info', duracion = 3000 }) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, mensaje, tipo }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duracion)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, removeToast }
}
