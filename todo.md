# todo.md — 지원금 레이더 MVP 빌드 체크리스트

> spec.md 기준. [사람]/[CC] 표시 준수. 체크박스는 진행하며 갱신.

## Phase 0 — 사람이 먼저 할 일
- [x] [사람] Supabase 프로젝트 생성, 키 3개(URL/anon/service_role) 확보
- [x] [사람] Anthropic API 키 발급
- [ ] [사람] **Anthropic 크레딧 충전** — 결제 버튼이 비활성화되는 문제로 아직 막혀있음 (다음 단계 1번)
- [x] [사람] `.env.local` 작성
- [ ] [사람] K-Startup API 활용신청 (data.go.kr)
- [ ] [사람] 기업마당 오픈API 활용신청

## Phase 1 — 뼈대 ✅ 완료
- [x] git 저장소 초기화 + GitHub 비공개 저장소 연결
- [x] Next.js 16(App Router) + TypeScript + Tailwind v4 스캐폴딩
- [x] `@supabase/ssr` 클라이언트 세팅 (server/client/proxy)
- [x] 랜딩 페이지, `/login`, `/signup`
- [x] **디자인 시스템**: 사업기획안/전자책 실제 색상(#00D4AA 틸/네이비)·폰트(Pretendard)·로고 에셋 적용

## Phase 2 — 도메인 데이터 & 폼 ✅ 완료 (단, 커버리지 좁음)
- [x] `grant_listings` 시드 데이터 (전자책 공고 4건)
- [x] `business_profiles` 입력 폼 (9개 항목)
- [ ] **시드 데이터 확장 필요** — 현재 4건뿐이라 "예비창업자+비서울" 등 조합은 매칭 결과 0건 (다음 단계 2번)

## Phase 3 — 분석 엔진 ✅ 코드 완료 / ⏸ 정확도 검증 대기
- [x] 규칙기반 1차 필터 (지역/업종/업력, 소상공인-개인/법인사업자 겹침 처리)
- [x] `/api/analyze` — Claude 프롬프트 매칭+진단
- [x] 위험 표현 가드레일
- [x] Claude API 실패 시 우아한 에러 처리 (크래시 화면 → 안내 메시지)
- [ ] **정확도 게이트**: 이민재 케이스(73점) 재현 — 크레딧 문제로 대기 중
- [x] `/result` 렌더

## Phase 4 — DB 스키마 ✅ 완료
- [x] 마이그레이션 0001, 0002 작성 및 Supabase 실행 완료
- [x] claim_order v2 실전 테스트 통과 (1회용 검증, bundle/starter 분기, 구독 연장 계산)

## Phase 5 — 결제 연동 ⚠️ 부분 완료
- [x] `/signup` 주문번호 검증 + claim_order 연결 (실제 가입 테스트 통과)
- [x] `/dashboard` (Starter) — 실제 테스트 통과
- [x] 리틀리 bundle 상품 연결 (`https://litt.ly/jiwongeumradar`)
- [ ] 리틀리 starter 상품 등록 + 링크 연결
- [ ] **리틀리 전달메시지에 가입 안내 삽입** — 결제→가입 흐름을 잇는 핵심 다리 (다음 단계 3번)
- [x] 랜딩페이지에 "구매 후 진행 순서" 4단계 안내 섹션 추가 (결제-가입 단절감 보완)
- [ ] 운영: 주문번호 수동 등록 절차 확립 (결제 알림 확인 → Supabase Table Editor 입력)

## Phase 6 — 공고 API 연동 (키 발급되면)
- [ ] K-Startup API 클라이언트 + `/api/grants/sync`
- [ ] 기업마당 API 클라이언트 연동
- [ ] 필드 매핑

## Phase 7 — 보안·QA ✅ 완료
- [x] 인증 게이트 확인 (미인증/미승인 리다이렉트)
- [x] 브라우저 E2E 테스트 (가입→주문번호→결과, 중복주문 차단, 구독 플로우)
- [x] 빌드 통과 확인

## Phase 8 — 배포 ⚠️ 부분 완료
- [x] `.env.local` git 미추적 확인 → GitHub 비공개 저장소 push 완료
- [ ] **키 회전**(service_role, Anthropic) — 로컬 개발 중 사용한 키는 배포 전 재발급 권장 (다음 단계 4번)
- [ ] Vercel 프로젝트 연결 + 환경변수 등록 (다음 단계 5번)
- [ ] Supabase Site URL = 배포 대표주소

## Phase 9 — 실결제 검수
- [ ] 실제 결제 1건 → 진짜 주문번호로 가입→승인→결과 확인 (Littly bundle 상품은 연결됨, 나머지 단계 남음)
- [x] 같은 주문번호 재사용 시 차단 확인 (완료)
- [x] Starter 재구매 시 만료일 연장 확인 (완료)
- [ ] 테스트 결제 환불

## 백로그 (이번 MVP 범위 아님)
- Builder(신청준비방 7탭), Diagnostic/Deep 단건결제, Season Pass
- D-day 플래너, 사업계획서 작성 보조 전체
- 리틀리 정기결제 API 연동(있다면) — 현재는 재구매 방식
- 주문번호 자동 등록(리틀리 알림 파싱) — 결제량 늘면 필요
