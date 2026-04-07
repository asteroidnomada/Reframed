'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-bg p-8 shadow-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle">
              <svg
                className="h-6 w-6 text-fg-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-fg">Check your email</h2>
          <p className="mt-2 text-sm text-fg-muted">
            We sent a password reset link to{' '}
            <span className="font-medium text-fg">{email}</span>.
          </p>
          <p className="mt-4 text-sm text-fg-muted">
            Back to{' '}
            <Link href="/sign-in" className="font-medium text-fg hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-lg border border-border bg-bg p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-fg tracking-tight">Reframed</h1>
          <p className="mt-1 text-sm text-fg-muted">Reset your password</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full mt-1" loading={loading}>
            Send reset link
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-fg-muted">
          Back to{' '}
          <Link href="/sign-in" className="font-medium text-fg hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
