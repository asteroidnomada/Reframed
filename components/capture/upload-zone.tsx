'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
  className?: string
}

export function UploadZone({ onFile, disabled, className }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed border-neutral-200 rounded-xl p-12 flex flex-col items-center gap-4',
        'hover:border-neutral-400 transition-colors cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M10 3v10M5 8l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-700">Upload a photo</p>
        <p className="text-xs text-neutral-400 mt-0.5">JPEG, PNG, HEIC up to 15 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}
