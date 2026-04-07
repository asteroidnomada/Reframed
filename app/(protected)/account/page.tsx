import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/nav/SignOutButton'
import { FREE_QUOTA } from '@/lib/constants'

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-medium text-fg">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('plan_tier, billing_state, generation_count_this_month, grace_period_ends_at')
    .eq('id', user!.id)
    .single()

  const isPro = profile?.plan_tier === 'pro'
  const isGrace = profile?.billing_state === 'grace'
  const used = profile?.generation_count_this_month ?? 0
  const gracePeriodEnds = profile?.grace_period_ends_at
    ? new Date(profile.grace_period_ends_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h2 className="text-2xl font-semibold text-fg">Account</h2>
        <p className="mt-1 text-sm text-fg-muted">Manage your account and billing.</p>
      </div>

      {isGrace && gracePeriodEnds && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Your payment failed. Update your billing info by{' '}
            <span className="font-medium">{gracePeriodEnds}</span> to keep Pro access.
          </p>
        </div>
      )}

      <SettingCard title="Account">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">Email</p>
          <p className="text-sm text-fg">{user?.email}</p>
        </div>
      </SettingCard>

      <SettingCard title="Plan">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">Current plan</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-fg capitalize">
                  {profile?.plan_tier ?? 'free'}
                </span>
                {isPro ? (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-bg font-medium">
                    Pro
                  </span>
                ) : (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted">
                    Free
                  </span>
                )}
              </div>
            </div>
            {!isPro && (
              <a
                href="#"
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-bg hover:bg-accent-hover transition-colors"
              >
                Upgrade to Pro
              </a>
            )}
          </div>

          {!isPro && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-fg-muted">Generations this month</p>
                <p className="text-xs font-medium text-fg">
                  {used} / {FREE_QUOTA}
                </p>
              </div>
              <div className="h-1.5 w-full rounded-full bg-bg-subtle overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.min((used / FREE_QUOTA) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {isPro && (
            <p className="text-xs text-fg-muted">Unlimited generations per month.</p>
          )}
        </div>
      </SettingCard>

      <SettingCard title="Billing">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">
            {isPro ? 'Manage your subscription and payment method.' : 'Upgrade to Pro for unlimited generations.'}
          </p>
          <a
            href="#"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg hover:bg-bg-subtle transition-colors"
          >
            {isPro ? 'Manage billing' : 'View plans'}
          </a>
        </div>
      </SettingCard>

      <SettingCard title="Session">
        <SignOutButton />
      </SettingCard>
    </div>
  )
}
