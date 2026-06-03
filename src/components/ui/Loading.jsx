export default function Loading({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      <p className="text-sm">{texto}</p>
    </div>
  )
}
