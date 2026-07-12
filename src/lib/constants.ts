export const LITTLY_URL_SCAN = process.env.NEXT_PUBLIC_LITTLY_URL_BUNDLE || '#'

/**
 * 실제 판매가는 landing-deploy(오픈클로 봇으로 별도 제작한 실제 마케팅 랜딩)에서
 * SCAN 9,900원으로 확정 판매 중.
 */
export const PRICING = {
  scan: {
    name: 'SCAN · 스캔',
    price: 9900,
    features: [
      '내 조건 기반 공고 후보 3~5개',
      '신청 자격 판정 — 공고 원문 근거 문장 포함',
      '공고별 필요 서류 체크리스트 + 마감 D-day',
      '평가 4축 예비점수 + 축별 이유',
      '공고문 7칸 해석 가이드북 (전자책)',
    ],
  },
} as const
