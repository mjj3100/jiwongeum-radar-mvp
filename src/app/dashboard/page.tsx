import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ResultsView } from '@/app/result/ResultsView'
import { LITTLY_URL_STARTER } from '@/lib/constants'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p>로그인이 필요합니다.</p>
        <Link href="/login" className="mt-4 inline-block underline">로그인하러 가기</Link>
      </main>
    )
  }

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
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-xl font-bold text-navy-900">Starter 구독이 필요합니다</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {starter?.expires_at
            ? `구독이 ${new Date(starter.expires_at).toLocaleDateString('ko-KR')}에 만료되었습니다.`
            : '무제한 맞춤 공고 조회는 Starter 구독자만 이용할 수 있어요.'}
        </p>
        <a
          href={LITTLY_URL_STARTER}
          className="mt-6 inline-block btn-primary"
        >
          Starter 구독(재)시작하기
        </a>
        <p className="mt-3 text-xs text-neutral-400">
          결제 후 새 주문번호를 <Link href="/signup" className="underline">가입 화면</Link>에서 입력하면 30일 연장됩니다.
        </p>
      </main>
    )
  }

  const { data: businessProfile } = await admin
    .from('business_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!businessProfile) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-sm text-neutral-600">사업 정보를 먼저 입력해야 맞춤 공고를 볼 수 있어요.</p>
        <Link href="/result" className="mt-4 inline-block btn-primary">
          사업 정보 입력하러 가기
        </Link>
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
      <p className="mx-auto mb-6 max-w-2xl text-xs text-neutral-400">
        Starter 구독 만료일: {new Date(starter!.expires_at!).toLocaleDateString('ko-KR')}
      </p>
      <ResultsView matches={matches ?? []} diagnosis={diagnoses?.[0] ?? null} canRerun />
    </main>
  )
}
