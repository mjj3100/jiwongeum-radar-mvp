import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppShell } from '@/components/AppShell'
import { BusinessProfileForm } from './BusinessProfileForm'
import { ResultsView } from './ResultsView'
import type { BusinessProfileInput } from '@/lib/types'
import { isAdminEmail } from '@/lib/admin-auth'

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

  const isAdmin = isAdminEmail(user.email)
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

  // 이용권이 없는 로그인 계정은 전부 /pending으로 보낸다 — 최초 승인 대기 중이든,
  // 환불로 이용권이 회수된 뒤 재구매해 새 주문번호를 입력해야 하는 경우든 동일하게
  // 여기서 주문번호를 (재)입력해 재클레임을 시도할 수 있다.
  if (!hasBundle && !hasActiveStarter) {
    redirect('/pending')
  }

  const { data: businessProfile } = await admin
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!businessProfile || edit === '1') {
    return (
      <AppShell isAdmin={isAdmin}>
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
    <AppShell isAdmin={isAdmin}>
      <ResultsView
        matches={matches ?? []}
        diagnosis={diagnoses?.[0] ?? null}
        canRerun={Boolean(hasActiveStarter)}
      />
    </AppShell>
  )
}
