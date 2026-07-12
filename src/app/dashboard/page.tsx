import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppShell } from '@/components/AppShell'
import { ResultsView } from '@/app/result/ResultsView'
import { LITTLY_URL_STARTER } from '@/lib/constants'
import { isAdminEmail } from '@/lib/admin-auth'
import type { BusinessProfileInput } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const { data: starter } = await admin
    .from('entitlements')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('product', 'starter')
    .maybeSingle()

  const isActive = starter?.expires_at && new Date(starter.expires_at) > new Date()

  if (!isActive) {
    return (
      <AppShell isAdmin={isAdmin} userEmail={user.email}>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-extrabold text-navy-900">Starter 구독이 필요합니다</h1>
          <p className="mt-3 text-base text-neutral-600">
            {starter?.expires_at
              ? `구독이 ${new Date(starter.expires_at).toLocaleDateString('ko-KR')}에 만료되었습니다.`
              : '무제한 맞춤 공고 조회는 Starter 구독자만 이용할 수 있어요.'}
          </p>
          <a href={LITTLY_URL_STARTER} className="btn-primary mt-8 inline-block">
            Starter 구독(재)시작하기
          </a>
          <p className="mt-4 text-sm text-neutral-400">
            결제 후 새 주문번호를 <Link href="/signup" className="underline">가입 화면</Link>에서 입력하면 30일 연장됩니다.
          </p>
        </div>
      </AppShell>
    )
  }

  const { data: businessProfile } = await admin
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!businessProfile) {
    return (
      <AppShell isAdmin={isAdmin} userEmail={user.email}>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-base text-neutral-600">사업 정보를 먼저 입력해야 맞춤 공고를 볼 수 있어요.</p>
          <Link href="/result" className="btn-primary mt-6 inline-block">
            사업 정보 입력하러 가기
          </Link>
        </div>
      </AppShell>
    )
  }

  const [{ data: matches }, { data: diagnoses }] = await Promise.all([
    admin
      .from('match_results')
      .select('*, grant_listings(title, original_url, support_content, support_scale, apply_end, agency)')
      .eq('user_id', user.id)
      .order('prep_priority', { ascending: true }),
    admin.from('diagnosis_reports').select('*').eq('user_id', user.id).limit(1),
  ])

  return (
    <AppShell isAdmin={isAdmin} userEmail={user.email}>
      <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-teal-dark/20 bg-teal-tint/60 px-5 py-4 text-sm font-semibold text-teal-dark">
        Starter 구독 만료일: {new Date(starter!.expires_at!).toLocaleDateString('ko-KR')}
      </div>
      <ResultsView
        matches={matches ?? []}
        diagnosis={diagnoses?.[0] ?? null}
        canRerun
        businessProfile={businessProfile as BusinessProfileInput & { updated_at: string }}
      />
    </AppShell>
  )
}
