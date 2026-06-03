export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full min-h-touch rounded-xl bg-surface-2 border px-4 text-base text-text placeholder:text-dim outline-none transition-colors duration-base',
          error ? 'border-danger' : 'border-border focus:border-primary',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
