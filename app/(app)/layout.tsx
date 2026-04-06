import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-100 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Reframed
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/gallery" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            Gallery
          </Link>
          <Link href="/account" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            Account
          </Link>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
