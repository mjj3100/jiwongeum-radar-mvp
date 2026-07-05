import type { BusinessProfileInput, FounderStatus, GrantListing } from '@/lib/types'

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

/**
 * 1차 규칙기반 필터: 명백히 부적합한 공고를 제거한다.
 * - 마감된 공고(apply_end < 오늘) 제외
 * - 지역 제한 공고인데 사업장 지역이 안 맞으면 제외
 * - 예비/기창업 단계 제한이 있는데 안 맞으면 제외
 *
 * 업종/매출/직원수는 애매한 경계가 많아 여기서 걸러내지 않고 2차 Claude 판정에 맡긴다.
 */
export function ruleBasedFilter(
  profile: BusinessProfileInput,
  listings: GrantListing[]
): GrantListing[] {
  const today = new Date().toISOString().slice(0, 10)

  return listings.filter((listing) => {
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
}
