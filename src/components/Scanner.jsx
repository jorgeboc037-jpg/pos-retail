import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

export default function Scanner({ open, onDetectado, onClose }) {
  const scannerRef = useRef(null)
  const idRef = useRef('scanner-' + Math.random().toString(36).slice(2))

  useEffect(() => {
    if (!open) return

    const scanner = new Html5Qrcode(idRef.current)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      (codigo) => {
        onDetectado(codigo)
      },
      () => {}
    ).catch(() => {})

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3">
        <p className="text-white font-semibold text-base">Escanear código</p>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active-scale">
          <X size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <div id={idRef.current} className="w-full rounded-2xl overflow-hidden" />
        <p className="text-white/60 text-sm text-center">Apuntá la cámara al código de barras del producto</p>
      </div>
    </div>
  )
}
