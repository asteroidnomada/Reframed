import { createClient } from '@/lib/supabase/server'
import { FREE_QUOTA } from '@/lib/constants'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('name, plan_tier, generation_count_this_month, quota_reset_at')
    .eq('id', user!.id)
    .single()

  const displayName = profile?.name || user?.email?.split('@')[0] || 'there'
  const isPro = profile?.plan_tier === 'pro'
  const used = profile?.generation_count_this_month ?? 0
  const limit = isPro ? null : FREE_QUOTA
  const resetAt = profile?.quota_reset_at
    ? new Date(profile.quota_reset_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-semibold text-fg">
          Welcome back, {displayName}
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Here&apos;s your workspace.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Plan */}
        <div className="rounded-lg border border-border bg-bg p-5 shadow-sm">
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">Plan</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-semibold text-fg capitalize">
              {profile?.plan_tier ?? 'free'}
            </span>
            {!isPro && (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted">
                Free
              </span>
            )}
            {isPro && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-bg font-medium">
                Pro
              </span>
            )}
          </div>
        </div>

        {/* Generations used */}
        <div className="rounded-lg border border-border bg-bg p-5 shadow-sm">
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">
            Generations this month
          </p>
          <p className="mt-2 text-xl font-semibold text-fg">
            {used}
            {limit !== null && (
              <span className="text-base font-normal text-fg-muted"> / {limit}</span>
            )}
          </p>
          {limit !== null && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-bg-subtle overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quota reset */}
        {!isPro && resetAt && (
          <div className="rounded-lg border border-border bg-bg p-5 shadow-sm">
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Quota resets
            </p>
            <p className="mt-2 text-xl font-semibold text-fg">{resetAt}</p>
          </div>
        )}
      </div>

      {/* Empty state CTA */}
      <div className="rounded-lg border border-dashed border-border-strong bg-bg-subtle p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg">
          <svg
            className="h-5 w-5 text-fg-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-fg">Upload your first space</p>
        <p className="mt-1 text-sm text-fg-muted">
          Take a photo of your commercial space to see it transformed.
        </p>
      </div>
    </div>
  )
}
