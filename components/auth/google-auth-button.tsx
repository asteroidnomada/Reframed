'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function GoogleAuthButton() {
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
    } finally {
      // Normally the page navigates away; this re-enables on failure
      setPending(false)
    }
  }

  return (
    <Button
      variant="secondary"
      className="w-full gap-2"
      onClick={handleClick}
      disabled={pending}
    >
      Continue with Google
    </Button>
  )
}
