import { useState } from 'react'

export function PasswordField({
  label,
  name = 'password',
  placeholder,
  required = true,
  minLength,
  className = '',
}: {
  label: string
  name?: string
  placeholder: string
  required?: boolean
  minLength?: number
  className?: string
}) {
  const [visible, setVisible] = useState(false)

  return <label className="grid gap-2 text-xs font-bold">
    {label}
    <span className="relative block">
      <input
        className={`h-10 w-full rounded-lg border border-[#e4e9e4] px-3 pr-11 ${className}`}
        name={name}
        type={visible ? 'text' : 'password'}
        minLength={minLength}
        required={required}
        placeholder={placeholder}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-[#89928c] hover:bg-[#f5f8f5]"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <span className="text-[9px] font-bold">{visible ? 'Hide' : 'Show'}</span>
      </button>
    </span>
  </label>
}
