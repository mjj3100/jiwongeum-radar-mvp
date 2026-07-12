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

  // source='manual'은 K-Startup/기업마당 API 키 발급 전 임시 검증용 시드 데이터였다.
  // 실시간 API 연동이 안정화된 지금은 매칭 후보에서 제외한다 (원문 URL이 없어 결과에서
  // 링크가 비는 문제의 원인이기도 하다). API 장애 시 수동 복구용으로 테이블엔 남겨둔다.
  const { data: listings } = await admin
    .from('grant_listings')
    .select('*')
    .in('source', ['kstartup', 'bizinfo'])
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
    const { error: matchError } = await admin.from('match_results').insert(
      result.matches.map((m) => ({
        user_id: userId,
        grant_listing_id: m.grant_listing_id,
        verdict: m.verdict,
        fit_reason: m.fit_reason,
        caution_note: m.caution_note,
        prep_priority: m.prep_priority,
        eligibility_checks: m.eligibility_checks,
        quote_excerpt: m.quote_excerpt,
        required_documents: m.required_documents,
      }))
    )
    // insert 실패를 조용히 넘기면 화면엔 "매칭 후보 0건"으로만 보여 원인을 알 수 없다.
    // 서버 로그에는 반드시 남겨서 스키마 불일치 등을 바로 알아챌 수 있게 한다.
    if (matchError) console.error('[runAnalysisForUser] match_results insert 실패:', matchError)
  }

  if (result.diagnosis) {
    // 화면은 prep_priority 오름차순으로 "1순위"를 정한다. Claude가 반환한 matches 배열
    // 순서가 항상 prep_priority 순이라는 보장이 없어(대체로 같지만 어긋날 수 있음),
    // matches[0]을 그냥 쓰면 진단이 화면에 표시되는 1순위 공고와 다른 공고에 붙는
    // 불일치가 생긴다. prep_priority가 가장 낮은(=1순위) 매치를 명시적으로 찾는다.
    const topPriorityMatch = result.matches.reduce(
      (top, m) => (m.prep_priority < top.prep_priority ? m : top),
      result.matches[0]
    )
    const { error: diagnosisError } = await admin.from('diagnosis_reports').insert({
      user_id: userId,
      grant_listing_id: topPriorityMatch?.grant_listing_id ?? null,
      relevance_score: result.diagnosis.relevance_score,
      concreteness_score: result.diagnosis.concreteness_score,
      differentiation_score: result.diagnosis.differentiation_score,
      feasibility_score: result.diagnosis.feasibility_score,
      axis_reasons: result.diagnosis.axis_reasons,
      risk_sentences: result.diagnosis.risk_sentences,
      summary: result.diagnosis.summary,
    })
    if (diagnosisError) console.error('[runAnalysisForUser] diagnosis_reports insert 실패:', diagnosisError)
  }

  return { ok: true, result }
}
