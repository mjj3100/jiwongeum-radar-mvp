export const LITTLY_URL_BUNDLE = process.env.NEXT_PUBLIC_LITTLY_URL_BUNDLE || '#'
export const LITTLY_URL_STARTER = process.env.NEXT_PUBLIC_LITTLY_URL_STARTER || '#'

/**
 * Starter 월구독의 "무제한 재조회" 가치가 약하다는 판단으로 랜딩 노출을 잠정 중단.
 * 기능 자체(엔터틀먼트·claim_order 연장 로직)는 그대로 유지되니, 다시 노출하려면
 * 이 값만 true로 바꾸면 된다.
 */
export const SHOW_STARTER_ON_LANDING = false

/**
 * 가격은 사업기획안(PPT)에 확정 수치가 없어 자리표시자로 둔다.
 * 실제 판매가가 정해지면 이 값과 리틀리 상품 가격을 함께 갱신할 것.
 */
export const PRICING = {
  bundle: {
    name: '전자책 + 맞춤 진단 리포트',
    price: null as number | null, // TODO: 사람이 확정 후 채우기
    features: ['맞춤 지원사업 후보 3~5개', '1순위 공고 미니 4축 예비진단', '전자책 전체'],
  },
  starter: {
    name: 'Starter 구독 (월간)',
    price: 9900,
    features: ['무제한 맞춤 공고 재조회', '30일마다 재구매로 연장'],
  },
} as const
