import Link from 'next/link'

export default function MarketingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Reframed</h1>
          <p className="text-neutral-500 leading-relaxed">
            Upload a photo of your commercial space and instantly see it
            transformed into a branded coworking environment.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full py-3 px-6 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="w-full py-3 px-6 border border-neutral-200 text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-neutral-400">
          3 free generations per month. No credit card required.
        </p>
      </div>
    </main>
  )
}
