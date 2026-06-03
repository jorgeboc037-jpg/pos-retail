const variants = {
  primary: 'bg-primary/20 text-primary',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/20 text-danger',
  muted: 'bg-surface-2 text-muted',
}

export default function Badge({ children, variant = 'muted', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
