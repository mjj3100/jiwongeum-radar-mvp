import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BusinessProfileForm } from './BusinessProfileForm'
import { ResultsView } from './ResultsView'

export default async function ResultPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // middleware가 미인증을 /login으로 리다이렉트하지만, 방어적으로 한 번 더 확인한다.
  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p>로그인이 필요합니다.</p>
        <Link href="/login" className="mt-4 inline-block underline">로그인하러 가기</Link>
      </main>
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
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-navy-900">이용권이 확인되지 않습니다</h1>
        <p className="mt-2 text-sm text-neutral-600">
          결제 후 안내받은 주문번호로 가입하면 바로 이용하실 수 있어요.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          결제 안내 보러가기
        </Link>
      </main>
    )
  }

  const { data: businessProfile } = await admin
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!businessProfile) {
    return (
      <main className="px-6 py-16">
        <BusinessProfileForm />
      </main>
    )
  }

  const [{ data: matches }, { data: diagnoses }] = await Promise.all([
    admin
      .from('match_results')
      .select('*, grant_listings(title)')
      .eq('user_id', user.id)
      .order('prep_priority', { ascending: true }),
    admin.from('diagnosis_reports').select('*').eq('user_id', user.id).limit(1),
  ])

  return (
    <main className="px-6 py-16">
      <ResultsView
        matches={matches ?? []}
        diagnosis={diagnoses?.[0] ?? null}
        canRerun={Boolean(hasBundle || hasActiveStarter)}
      />
    </main>
  )
}
