'use client'

export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        Sign out
      </button>
    </form>
  )
}
