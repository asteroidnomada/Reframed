import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <input
          ref={ref}
          className={`h-10 w-full rounded-md border px-3 text-sm text-fg placeholder:text-fg-faint transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-red-400' : 'border-border'
          } bg-bg ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
