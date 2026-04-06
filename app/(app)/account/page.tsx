export default function AccountPage() {
  return (
    <main className="px-4 py-8 max-w-md mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Account</h1>

      <section className="border border-neutral-100 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-neutral-700">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Free</p>
            <p className="text-xs text-neutral-500">3 generations / month</p>
          </div>
          <button className="text-xs font-medium px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      </section>

      <section className="border border-neutral-100 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-medium text-neutral-700">Quota</h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>0 of 3 used</span>
            <span>Resets monthly</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-neutral-900 rounded-full" />
          </div>
        </div>
      </section>

      <button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
        Sign out
      </button>
    </main>
  )
}
