'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
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
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-sm text-neutral-500">
            We sent a password reset link to{' '}
            <span className="font-medium text-neutral-900">{email}</span>.
          </p>
          <p className="text-sm text-neutral-500">
            Back to{' '}
            <Link href="/login" className="text-neutral-900 font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm text-neutral-500">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-sm text-center text-neutral-500">
          Back to{' '}
          <Link href="/login" className="text-neutral-900 font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
