# todo.md — 지원금 레이더 MVP 빌드 체크리스트

> spec.md 기준. [사람]/[CC] 표시 준수. 체크박스는 진행하며 갱신.

## Phase 0 — 사람이 먼저 할 일 (병렬 진행 가능)
- [ ] [사람] Supabase 프로젝트 생성, 키 3개(URL/anon/service_role) 확보
- [ ] [사람] Anthropic API 키 발급 + 크레딧 충전($10~20)
- [ ] [사람] `.env.local` 작성 (Claude Code에 값 채팅으로 주지 말 것)
- [ ] [사람] K-Startup API 활용신청 (data.go.kr) — 승인 대기 며칠 걸릴 수 있음
- [ ] [사람] 기업마당 오픈API 활용신청

## Phase 1 — 뼈대
- [x] git 저장소 초기화
- [ ] [CC] Next.js 14(App Router) + TypeScript + Tailwind 스캐폴딩
- [ ] [CC] `.gitignore` (.env*, node_modules 등)
- [ ] [CC] `@supabase/ssr` 클라이언트 세팅 (server/client/middleware)
- [ ] [CC] 랜딩 페이지 `/` (지원금 레이더 카피 + 리틀리 CTA 자리)
- [ ] [CC] `/login` 페이지

## Phase 2 — 도메인 데이터 & 시드
- [ ] [CC] `grant_listings` 시드 데이터 스크립트 (전자책 수록 공고 4건: 혁신 소상공인 AI활용지원, 서울 유니콘 챌린지, 서울 AI허브 인프라, 소상공인 정책자금)
- [ ] [CC] `business_profiles` 입력 폼 (9개 항목: 사업자상태/지역/업종/창업일/매출구간/직원수/사업아이템/필요지원/준비상태)

## Phase 3 — 분석 엔진
- [ ] [CC] 규칙기반 1차 필터 함수 (지역/업종/업력 매칭)
- [ ] [CC] `/api/analyze` — Claude 프롬프트로 적합도 판정 3~5개 + 미니4축 진단
- [ ] [CC] 위험 표현 가드레일 (시스템 프롬프트 + 응답 후 정규식 검증)
- [ ] [CC] **정확도 게이트**: 전자책 이민재 케이스(관련성22/구체성16/차별성17/실현가능성18=73점) 재현 여부 확인
- [ ] [CC] `/result` 렌더 (맞춤공고 카드 + 진단 리포트)

## Phase 4 — DB 스키마
- [ ] [CC] 마이그레이션 0001 작성 (profiles/orders/entitlements/business_profiles/grant_listings/match_results/diagnosis_reports + RLS)
- [ ] [사람] 0001 Supabase SQL Editor 실행
- [ ] [CC] 마이그레이션 0002 작성 (claim_order v2, 구독연장 로직)
- [ ] [사람] 0002 실행

## Phase 5 — 결제 연동
- [ ] [CC] `/signup` 주문번호 입력칸 + 형식검증(16자리, 공백/하이픈 제거) + claim_order 연결
- [ ] [CC] `/dashboard` (Starter 전용, entitlement.expires_at 체크)
- [ ] [사람] 리틀리 상품 2종 등록 (bundle, starter) → 결제 링크 확보
- [ ] [사람] 리틀리 전달메시지에 가입 링크 삽입

## Phase 6 — 공고 API 연동 (키 발급되면)
- [ ] [CC] K-Startup API 클라이언트 + `/api/grants/sync`
- [ ] [CC] 기업마당 API 클라이언트 연동
- [ ] [CC] 필드 매핑 (원본 API 응답 → grant_listings 스키마)

## Phase 7 — 보안·QA
- [ ] [CC] 보안 리뷰: `/result`/`/dashboard`/`/api/analyze` 인증 게이트 확인
- [ ] [CC] `/qa` 브라우저 E2E: 가입→주문번호→결과 전체 플로우
- [ ] [CC] 빌드 통과 확인 (`npm run build`)

## Phase 8 — 배포
- [ ] [CC] `.env.local` git 미추적 확인 → GitHub 비공개 저장소 push
- [ ] [사람] 키 회전(service_role, Anthropic) 후 `.env.local` 갱신
- [ ] [사람] Vercel 프로젝트 연결 + 환경변수 등록
- [ ] [사람] Supabase Site URL = 배포 대표주소

## Phase 9 — 실결제 검수
- [ ] [사람] 실제 결제 1건 → 진짜 주문번호로 가입→승인→결과 확인
- [ ] [사람] 같은 주문번호 재사용 시 차단 확인
- [ ] [사람] Starter 재구매 시 만료일 연장 확인
- [ ] [사람] 테스트 결제 환불

## 백로그 (이번 MVP 범위 아님)
- Builder(신청준비방 7탭), Diagnostic/Deep 단건결제, Season Pass
- D-day 플래너, 사업계획서 작성 보조 전체
- 리틀리 정기결제 API 연동(있다면) — 현재는 재구매 방식
- 주문번호 자동 등록(리틀리 알림 파싱)
