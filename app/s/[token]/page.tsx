// Share link viewer — public, no auth required
// Standalone page: no nav, no login wall, just the generated image + CTA
interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Generated image — signed URL resolved server-side */}
        <div className="aspect-[4/3] rounded-xl bg-neutral-200 overflow-hidden">
          {/* Image rendered here after share link resolution */}
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            Loading...
          </div>
        </div>

        <div className="space-y-1 text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-widest">
            Generated with Reframed
          </p>
          <p className="text-sm text-neutral-600" suppressHydrationWarning>
            Token: {token}
          </p>
        </div>

        <a
          href="/"
          className="block w-full py-3 bg-neutral-900 text-white text-sm font-medium text-center rounded-lg hover:bg-neutral-700 transition-colors"
        >
          Make your own
        </a>
      </div>
    </main>
  )
}
