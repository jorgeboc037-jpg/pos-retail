import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, titulo, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Panel */}
      <div
        className="relative z-10 w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-safe max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-text">{titulo}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted active-scale active:text-text"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
