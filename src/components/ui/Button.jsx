const variants = {
  primary: 'bg-primary text-primary-fg',
  danger: 'bg-danger text-danger-fg',
  ghost: 'bg-transparent border border-border text-text',
  surface: 'bg-surface-2 text-text border border-border',
}

export default function Button({ children, variant = 'primary', className = '', disabled = false, onClick, type = 'button', fullWidth = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 font-semibold text-base min-h-touch active-scale select-none',
        variants[variant],
        disabled ? 'opacity-40 pointer-events-none' : '',
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
