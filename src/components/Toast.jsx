import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const iconos = {
  exito: <CheckCircle size={18} className="text-primary shrink-0" />,
  error: <AlertCircle size={18} className="text-danger shrink-0" />,
  info: <Info size={18} className="text-muted shrink-0" />,
  warning: <AlertCircle size={18} className="text-warning shrink-0" />,
}

function ToastItem({ toast, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 min-w-[260px] max-w-[90vw]">
      {iconos[toast.tipo] || iconos.info}
      <p className="text-sm text-text flex-1">{toast.mensaje}</p>
      <button onClick={() => onRemove(toast.id)} className="text-muted active-scale p-1">
        <X size={16} />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
