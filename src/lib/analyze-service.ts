import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { ruleBasedFilter } from '@/lib/grants/match'
import { analyzeGrants } from '@/lib/anthropic/analyze'
import type { AnalyzeResult, GrantListing } from '@/lib/types'

export type AnalyzeError = 'no_entitlement' | 'no_business_profile' | 'analysis_failed'

const ANALYZE_ERROR_MESSAGES: Record<AnalyzeError, string> = {
  no_entitlement: '이용권이 확인되지 않습니다. 결제 후 주문번호로 가입해주세요.',
  no_business_profile: '사업 정보를 먼저 입력해주세요.',
  analysis_failed: '분석 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
}

export function analyzeErrorMessage(error: AnalyzeError): string {
  return ANALYZE_ERROR_MESSAGES[error]
}

/**
 * bundle 또는 미만료 starter 이용권을 가진 사용자에 대해 매칭+진단을 생성하고
 * match_results / diagnosis_reports에 최신 결과로 교체 저장한다.
 * /api/analyze 라우트와 /result의 폼 제출 서버 액션이 공통으로 사용한다.
 */
export async function runAnalysisForUser(
  userId: string
): Promise<{ ok: true; result: AnalyzeResult } | { ok: false; error: AnalyzeError }> {
  const admin = createAdminClient()

  const { data: entitlements } = await admin
    .from('entitlements')
    .select('product, expires_at')
    .eq('user_id', userId)
    .in('product', ['bundle', 'starter'])

  const hasBundle = entitlements?.some((e) => e.product === 'bundle')
  const hasActiveStarter = entitlements?.some(
    (e) => e.product === 'starter' && e.expires_at && new Date(e.expires_at) > new Date()
  )

  if (!hasBundle && !hasActiveStarter) {
    return { ok: false, error: 'no_entitlement' }
  }

  const { data: profile } = await admin
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!profile) {
    return { ok: false, error: 'no_business_profile' }
  }

  const { data: listings } = await admin.from('grant_listings').select('*')
  const candidates = ruleBasedFilter(profile, (listings ?? []) as GrantListing[])
  const topCandidates = candidates.slice(0, 8)

  let result: AnalyzeResult
  try {
    result = await analyzeGrants(profile, topCandidates)
  } catch (err) {
    // Claude API 장애·크레딧 부족·응답 파싱 실패 등은 사용자에게 스택트레이스를
    // 노출하지 않고 일반 메시지로 감싼다. 원인은 서버 로그에만 남긴다.
    console.error('[analyzeGrants] 분석 실패:', err)
    return { ok: false, error: 'analysis_failed' }
  }

  await admin.from('match_results').delete().eq('user_id', userId)
  await admin.from('diagnosis_reports').delete().eq('user_id', userId)

  if (result.matches.length > 0) {
    await admin.from('match_results').insert(
      result.matches.map((m) => ({
        user_id: userId,
        grant_listing_id: m.grant_listing_id,
        verdict: m.verdict,
        fit_reason: m.fit_reason,
        caution_note: m.caution_note,
        prep_priority: m.prep_priority,
      }))
    )
  }

  if (result.diagnosis) {
    await admin.from('diagnosis_reports').insert({
      user_id: userId,
      grant_listing_id: result.matches[0]?.grant_listing_id ?? null,
      relevance_score: result.diagnosis.relevance_score,
      concreteness_score: result.diagnosis.concreteness_score,
      differentiation_score: result.diagnosis.differentiation_score,
      feasibility_score: result.diagnosis.feasibility_score,
      risk_sentences: result.diagnosis.risk_sentences,
      summary: result.diagnosis.summary,
    })
  }

  return { ok: true, result }
}
