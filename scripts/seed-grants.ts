/**
 * grant_listings 시드 스크립트. 재실행 가능(idempotent) — source='manual' 기존 행을
 * 지우고 다시 넣는다.
 *
 * ⚠️ 이 4건은 전자책(2026.06.19 확인 기준) 수록 예시를 그대로 옮긴 "검증용" 데이터다.
 * 마감일 중 두 건(AI활용지원, 유니콘 챌린지)은 로컬 개발 중 매칭 결과가 항상 나오도록
 * 원문 날짜보다 뒤로 미뤄뒀다 — 실 런칭 전에는 반드시 실제 공고와 진짜 마감일로 교체할 것.
 * "서울 AI허브 인프라"는 전자책 원문에서도 "이미 마감, 다음 회차 추적 대상"으로 다루므로
 * 의도적으로 마감된 날짜(2026-05-08) 그대로 둔다 — 규칙기반 필터가 이를 걸러내는지 보는 용도.
 *
 * 실행: npm run seed:grants
 * 필요 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

const seedListings = [
  {
    source: 'manual',
    title: '2026년 혁신 소상공인 AI활용지원 사업 참여 소상공인 모집 공고',
    agency: '중소벤처기업부 · 소상공인시장진흥공단',
    apply_start: '2026-06-12',
    apply_end: '2026-09-03', // 원문은 2026-07-03. 로컬 테스트용으로 연장 (위 주석 참고)
    target_desc: '소상공인기본법 제2조에 따른 소상공인, 신청일 현재 정상 영업 중인 소상공인',
    exclude_desc: null,
    support_content: 'AI 활용모델 구축, 비즈니스모델 구현, 사업장 내 AI 시스템 구축, 상용 시제품 개발, 타겟 마케팅 등',
    support_scale: '세부 유형별 상이. 일부 안내 기준 사업화자금 최대 4천만원',
    region_scope: null, // 전국
    industry_scope: null,
    founder_stage_scope: ['소상공인'],
    original_url: null,
  },
  {
    source: 'manual',
    title: '2026 서울 유니콘 챌린지',
    agency: '서울특별시',
    apply_start: null,
    apply_end: '2026-08-30', // 원문은 2026-06-30. 로컬 테스트용으로 연장 (위 주석 참고)
    target_desc: '창업 10년 미만 국내외 스타트업',
    exclude_desc: null,
    support_content: '총 7개사 선발, 총상금 1.2억원, 투자자 밋업 등 후속지원',
    support_scale: '창업경진대회·성장지원 성격 (일반 운영비 지원 아님)',
    region_scope: ['서울'],
    industry_scope: null,
    founder_stage_scope: ['예비창업자', '개인사업자', '법인사업자'],
    original_url: null,
  },
  {
    source: 'manual',
    title: '2026 상반기 서울 AI 허브 고성능 컴퓨팅 인프라 지원사업',
    agency: '서울 AI 허브',
    apply_start: '2026-04-14',
    apply_end: '2026-05-08',
    target_desc: '서울 소재 AI 스타트업 등 세부 자격 확인 필요',
    exclude_desc: null,
    support_content: '클라우드 GPU 자원 바우처 등 AI 개발 인프라 지원',
    support_scale: 'Track 1 최대 6천만원 상당, Track 2 최대 1천만원 상당',
    region_scope: ['서울'],
    industry_scope: ['AI'],
    founder_stage_scope: null,
    original_url: null,
  },
  {
    source: 'manual',
    title: '소상공인 정책자금',
    agency: '중소벤처기업부 · 소상공인시장진흥공단',
    apply_start: null,
    apply_end: null, // 융자 상시 프로그램, 자금별 회차 상이
    target_desc: '소상공인 요건·업종·신용·사업기간·자금 목적 등 자금별 상이',
    exclude_desc: null,
    support_content: '보조금이 아닌 융자. 금리·상환기간·거치기간 확인 필요',
    support_scale: '자금별 상이',
    region_scope: null,
    industry_scope: null,
    founder_stage_scope: ['소상공인'],
    original_url: null,
  },
]

async function main() {
  const { error: deleteError } = await supabase.from('grant_listings').delete().eq('source', 'manual')
  if (deleteError) {
    console.error('기존 시드 삭제 실패:', deleteError.message)
    process.exit(1)
  }

  const { data, error } = await supabase.from('grant_listings').insert(seedListings).select('id, title')

  if (error) {
    console.error('시드 삽입 실패:', error.message)
    process.exit(1)
  }

  console.log(`${data.length}건 삽입 완료:`)
  for (const row of data) console.log(`  - ${row.title}`)
}

main()
