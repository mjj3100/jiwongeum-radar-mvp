import type { BusinessProfileInput, FounderStatus, GrantListing, SupportNeeded } from '@/lib/types'

/**
 * "소상공인"은 사업자 등록 형태(개인/법인)가 아니라 매출·업종 기준 규모 분류라
 * 개인사업자·법인사업자와 상호배타적이지 않다. 실제로 대부분의 소규모 개인/법인사업자가
 * 소상공인기본법상 소상공인에 해당한다 (전자책 이민재 사례: 개인사업자이면서
 * "소상공인 정책자금" 조건부 추천을 받음). 그래서 공고가 "소상공인"만 요구해도
 * 개인/법인사업자를 규칙 단계에서 걸러내지 않고 2차 Claude 판정에 맡긴다.
 * 반대로 예비창업자는 정의상 아직 등록된 사업체가 없어 소상공인일 수 없으므로 걸러낸다.
 */
function matchesFounderStage(founderStatus: FounderStatus, scope: string[]): boolean {
  if (scope.includes(founderStatus)) return true
  if (scope.includes('소상공인') && (founderStatus === '개인사업자' || founderStatus === '법인사업자')) {
    return true
  }
  return false
}

const NEED_KEYWORDS: Record<SupportNeeded, string[]> = {
  사업화자금: ['사업화', '자금', '바우처'],
  개발비: ['개발', 'R&D', '기술개발', 'AI'],
  광고비: ['마케팅', '홍보', '광고', '판로', '유통', '수출'],
  장비: ['장비', '설비', '스마트공장'],
  공간: ['입주', '공간', '사무공간', '보육'],
  정책자금: ['정책자금', '융자', '대출', '이차보전'],
}

/**
 * 규칙기반 필터 통과 후보가 수백 건에 달할 수 있어(지역/업종은 컬럼이 비어있는 공고가
 * 많아 하드 필터에서 못 걸러짐), 실제 Claude에 넘길 상위 N개를 고를 때 관련도 순으로
 * 정렬하지 않으면 항상 DB 저장 순서상 앞쪽의 공고(관련 없어도)만 보게 된다.
 * region_scope/industry_scope 컬럼뿐 아니라 title/target_desc 등 텍스트에도 지역·업종
 * 키워드가 있는 경우가 많아 텍스트 포함 여부까지 점수에 반영한다. 최종 적합/부적합 판정은
 * 여전히 2차 Claude 판정이 하고, 이 점수는 "누구를 Claude에게 보여줄지"만 정한다.
 */
function scoreRelevance(profile: BusinessProfileInput, listing: GrantListing): number {
  const haystack = [
    listing.title,
    listing.target_desc,
    listing.exclude_desc,
    listing.support_content,
    listing.support_scale,
    ...(listing.industry_scope ?? []),
    ...(listing.region_scope ?? []),
    ...(listing.founder_stage_scope ?? []),
  ]
    .filter(Boolean)
    .join(' ')

  let score = 0

  const regionTokens = profile.region.split(/\s+/).filter((t) => t.length >= 2)
  for (const t of regionTokens) {
    if (haystack.includes(t)) score += 3
  }

  if (haystack.includes(profile.founder_status)) score += 2
  if (
    (profile.founder_status === '개인사업자' || profile.founder_status === '법인사업자') &&
    haystack.includes('소상공인')
  ) {
    score += 1
  }

  const industryTokens = profile.industry.split(/[/,·\s]+/).filter((t) => t.length >= 2)
  for (const t of industryTokens) {
    if (haystack.includes(t)) score += 2
  }

  for (const kw of NEED_KEYWORDS[profile.support_needed] ?? []) {
    if (haystack.includes(kw)) score += 1
  }

  return score
}

/**
 * 1차 규칙기반 필터: 명백히 부적합한 공고를 제거하고, 남은 후보를 관련도 순으로 정렬한다.
 * - 마감된 공고(apply_end < 오늘) 제외
 * - 지역 제한 공고인데 사업장 지역이 안 맞으면 제외
 * - 예비/기창업 단계 제한이 있는데 안 맞으면 제외
 *
 * 업종/매출/직원수는 애매한 경계가 많아 여기서 걸러내지 않고 2차 Claude 판정에 맡긴다.
 * 대신 관련도 점수로 정렬해둬야 호출부의 상위 N개 슬라이스가 실제로 관련 있는 후보를 고른다.
 */
export function ruleBasedFilter(
  profile: BusinessProfileInput,
  listings: GrantListing[]
): GrantListing[] {
  const today = new Date().toISOString().slice(0, 10)

  const filtered = listings.filter((listing) => {
    if (listing.apply_end && listing.apply_end < today) return false

    if (listing.region_scope && listing.region_scope.length > 0) {
      const regionMatches = listing.region_scope.some((r) => profile.region.includes(r))
      if (!regionMatches) return false
    }

    if (listing.founder_stage_scope && listing.founder_stage_scope.length > 0) {
      const stageMatches = matchesFounderStage(profile.founder_status, listing.founder_stage_scope)
      if (!stageMatches) return false
    }

    return true
  })

  return filtered
    .map((listing) => ({ listing, score: scoreRelevance(profile, listing) }))
    .sort((a, b) => b.score - a.score)
    .map(({ listing }) => listing)
}
