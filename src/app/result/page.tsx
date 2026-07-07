import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppShell } from '@/components/AppShell'
import { BusinessProfileForm } from './BusinessProfileForm'
import { ResultsView } from './ResultsView'
import type { BusinessProfileInput } from '@/lib/types'

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const { edit } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // middleware가 미인증을 /login으로 리다이렉트하지만, 방어적으로 한 번 더 확인한다.
  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-base text-neutral-600">로그인이 필요합니다.</p>
          <Link href="/login" className="btn-primary mt-6 inline-block">로그인하러 가기</Link>
        </div>
      </AppShell>
    )
  }

  const admin = createAdminClient()

  const { data: entitlements } = await admin
    .from('entitlements')
    .select('product, expires_at')
    .eq('user_id', user.id)
    .in('product', ['bundle', 'starter'])

  const hasBundle = entitlements?.some((e) => e.product === 'bundle')
  const hasActiveStarter = entitlements?.some(
    (e) => e.product === 'starter' && e.expires_at && new Date(e.expires_at) > new Date()
  )

  if (!hasBundle && !hasActiveStarter) {
    const { data: profile } = await admin
      .from('profiles')
      .select('pending_order_no')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.pending_order_no) {
      redirect('/pending')
    }

    return (
      <AppShell>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-extrabold text-navy-900">이용권이 확인되지 않습니다</h1>
          <p className="mt-3 text-base text-neutral-600">
            결제 후 안내받은 주문번호로 가입하면 바로 이용하실 수 있어요.
          </p>
          <Link href="/" className="btn-primary mt-8 inline-block">
            결제 안내 보러가기
          </Link>
        </div>
      </AppShell>
    )
  }

  const { data: businessProfile } = await admin
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!businessProfile || edit === '1') {
    return (
      <AppShell>
        <BusinessProfileForm defaultValues={businessProfile as BusinessProfileInput | undefined} />
      </AppShell>
    )
  }

  const [{ data: matches }, { data: diagnoses }] = await Promise.all([
    admin
      .from('match_results')
      .select('*, grant_listings(title, original_url, support_content, support_scale)')
      .eq('user_id', user.id)
      .order('prep_priority', { ascending: true }),
    admin.from('diagnosis_reports').select('*').eq('user_id', user.id).limit(1),
  ])

  return (
    <AppShell>
      <ResultsView
        matches={matches ?? []}
        diagnosis={diagnoses?.[0] ?? null}
        canRerun={Boolean(hasActiveStarter)}
      />
    </AppShell>
  )
}
