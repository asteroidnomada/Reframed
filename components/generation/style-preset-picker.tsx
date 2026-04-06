'use client'

import { cn } from '@/lib/utils'
import type { StylePreset } from '@/lib/types'

const PRESETS: { value: StylePreset; label: string; description: string }[] = [
  { value: 'minimalist', label: 'Minimalist', description: 'Clean lines, neutral tones' },
  { value: 'industrial', label: 'Industrial', description: 'Exposed materials, raw textures' },
  { value: 'warm_neighborhood', label: 'Warm Neighborhood Café', description: 'Cozy, inviting, local feel' },
]

interface StylePresetPickerProps {
  value: StylePreset | null
  onChange: (preset: StylePreset) => void
}

export function StylePresetPicker({ value, onChange }: StylePresetPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={cn(
            'text-left px-4 py-3 rounded-xl border transition-colors',
            value === preset.value
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 hover:border-neutral-400'
          )}
        >
          <p className="text-sm font-medium">{preset.label}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{preset.description}</p>
        </button>
      ))}
    </div>
  )
}
