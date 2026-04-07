import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <span className="text-lg font-semibold text-fg tracking-tight">
          Reframed
        </span>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-fg-muted hidden sm:block">
              {user.email}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
