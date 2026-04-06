import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function getQuotaLimit(planTier: 'free' | 'pro'): number {
  return planTier === 'pro' ? Infinity : 3
}

export function isQuotaExceeded(
  generationCount: number,
  planTier: 'free' | 'pro'
): boolean {
  if (planTier === 'pro') return false
  return generationCount >= getQuotaLimit(planTier)
}
