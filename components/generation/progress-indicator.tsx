'use client'

import { useEffect, useState } from 'react'
import type { GenerationStatus } from '@/lib/types'

const STAGES = [
  { label: 'Analyzing your space', minMs: 0 },
  { label: 'Applying style', minMs: 5000 },
  { label: 'Rendering details', minMs: 12000 },
  { label: 'Finalizing', minMs: 22000 },
] as const

interface ProgressIndicatorProps {
  status: GenerationStatus
  startedAt: Date
}

export function ProgressIndicator({ status, startedAt }: ProgressIndicatorProps) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (status !== 'processing') return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt.getTime()
      const nextStage = STAGES.findLastIndex((s) => elapsed >= s.minMs)
      setStageIndex(Math.max(0, nextStage))
    }, 500)

    return () => clearInterval(interval)
  }, [status, startedAt])

  if (status === 'completed' || status === 'failed') return null

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-neutral-600">{STAGES[stageIndex].label}&hellip;</p>
    </div>
  )
}
