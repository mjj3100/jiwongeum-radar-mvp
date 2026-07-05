# todo.md — 지원금 레이더 MVP 빌드 체크리스트

> spec.md 기준. [사람]/[CC] 표시 준수. 체크박스는 진행하며 갱신.

## Phase 0 — 사람이 먼저 할 일
- [x] [사람] Supabase 프로젝트 생성, 키 3개(URL/anon/service_role) 확보
- [x] [사람] Anthropic API 키 발급
- [x] [사람] **Anthropic 크레딧 충전 완료** ($20) — 이전 핵심 블로커였던 문제 해결
- [x] [사람] `.env.local` 작성
- [x] [사람] K-Startup API 활용신청 (data.go.kr) — 승인 완료, 실제 호출로 검증됨
- [x] [사람] 기업마당 오픈API 활용신청 — 승인 완료, 실제 호출로 검증됨

## Phase 1 — 뼈대 ✅ 완료
- [x] git 저장소 초기화 + GitHub 비공개 저장소 연결
- [x] Next.js 16(App Router) + TypeScript + Tailwind v4 스캐폴딩
- [x] `@supabase/ssr` 클라이언트 세팅 (server/client/proxy)
- [x] 랜딩 페이지, `/login`, `/signup`
- [x] **디자인 시스템 v1**: 사업기획안/전자책 실제 색상(#00D4AA 틸/네이비)·폰트(Pretendard)·로고 에셋 적용
- [x] **디자인 시스템 v2**: 로그인/가입 split-screen 레이아웃, 결과/대시보드 브랜드 배경+카드 깊이감, 랜딩 로그인 링크

## Phase 2 — 도메인 데이터 & 폼 ✅ 완료
- [x] `grant_listings` 시드 데이터 (전자책 공고 4건, 수동 백업용으로 유지)
- [x] `business_profiles` 입력 폼 (11개 항목 — 나이대/성별 추가 완료)
- [x] **나이대/성별 항목 추가** — 원래 오픈카톡 프로세스 항목 복원, Claude 프롬프트에도 반영(청년/여성/중장년 특화 공고 판별용). 마이그레이션 0005 실행 완료, 프로덕션 배포 완료, 실제 저장 확인 완료

## Phase 3 — 분석 엔진 ✅ 완료 (실제 크레딧으로 종단 검증 완료)
- [x] 규칙기반 1차 필터 (지역/업종/업력, 소상공인-개인/법인사업자 겹침 처리)
- [x] `/api/analyze` — Claude 프롬프트 매칭+진단
- [x] 위험 표현 가드레일 — 프로덕션 확인: 금지표현 없음
- [x] Claude API 실패 시 우아한 에러 처리
- [x] 실제 공고 원문 길이로 인한 JSON 응답 잘림 버그 수정 (텍스트 절삭 + max_tokens 8192)
- [x] **정확도 게이트 통과**: 이민재 케이스 프로덕션 재현 — 70/100 (관련성22·구체성15·차별성16·실현가능성17) vs 전자책 원본 73/100(22·16·17·18). 거의 일치, 위험문장 점검("5개 매장 테스트 완료" 정량근거 부족 등)도 전자책 패턴과 동일하게 탐지
- [x] `/result` 렌더 + 정보 수정 기능(`?edit=1`)
- [x] 재진단 남용 방지: "다시 진단받기"(무변경 재호출)는 Starter 전용, Bundle은 정보 수정을 통해서만 재진단
- [x] **매칭 0건 버그 수정**: 응답 스키마가 `matches.min(1)`을 강제해서, Claude가 정말로 맞는 공고가 없다고 판단한 정상적인 경우에도 스키마 검증 실패 → "분석 중 문제가 발생했습니다" 에러로 잘못 표시되던 문제. min(1) 제거 + 빈 결과용 안내 UI(원인 설명 + 재시도 유도) 추가

## Phase 4 — DB 스키마 ✅ 거의 완료
- [x] 마이그레이션 0001, 0002 작성 및 Supabase 실행 완료
- [x] claim_order v2 실전 테스트 통과 (1회용 검증, bundle/starter 분기, 구독 연장 계산)
- [x] 마이그레이션 0003 실행 완료 → 0004로 수정(부분 인덱스가 PostgREST onConflict와 안 맞아 일반 유니크 제약으로 교체) → 실행 완료

## Phase 5 — 결제 연동 ✅ 거의 완료
- [x] `/signup` 주문번호 검증 + claim_order 연결 (실제 가입 테스트 통과, 프로덕션에서도 확인)
- [x] `/dashboard` (Starter) — 실제 테스트 통과
- [x] 리틀리 bundle 상품 연결 (`https://litt.ly/jiwongeumradar`)
- [x] **리틀리 전달메시지에 가입 안내 삽입 완료** (실제 배포 주소 반영)
- [x] 랜딩페이지에 "구매 후 진행 순서" 4단계 안내 섹션 추가
- [ ] 리틀리 starter 상품 등록 + 링크 연결
- [ ] 운영: 주문번호 수동 등록 절차 확립 (결제 알림 확인 → Supabase Table Editor 입력) — 지금은 Claude Code가 스크립트로 대행 중

## Phase 6 — 공고 API 연동 ✅ 완료
- [x] K-Startup API 키 발급 + 실제 호출 검증 (99/100건이 현재 접수중으로 정상 필터링)
- [x] 기업마당 API 키 발급 + 실제 호출 검증 (RSS/XML 파싱 정상)
- [x] K-Startup API 클라이언트 (`src/lib/grants/kstartup.ts`) — 현재 접수중(rcrt_prgs_yn=Y)만, 페이지네이션, 지역/날짜 정규화
- [x] 기업마당 API 클라이언트 (`src/lib/grants/bizinfo.ts`) — fast-xml-parser로 RSS 파싱, 신청기간 문자열 파싱
- [x] `/api/grants/sync` 라우트 — CRON_SECRET 인증, 배치 upsert
- [x] Vercel Cron 설정 (매일 03:00 UTC 자동 동기화) — `vercel.json`
- [x] **프로덕션 실제 DB 반영 확인 완료** — `{"ok":true,"fetched":{"kstartup":218,"bizinfo":100},"upserted":318}` 실제 지원사업 318건 저장됨

## Phase 7 — 보안·QA ✅ 완료
- [x] 인증 게이트 확인 (미인증/미승인 리다이렉트)
- [x] 브라우저 E2E 테스트 (가입→주문번호→결과, 중복주문 차단, 구독 플로우, 프로덕션 재검증)
- [x] 빌드 통과 확인
- [x] `/api/grants/sync` 인증 가드 확인 (헤더 없으면 401)

## Phase 8 — 배포 ✅ 완료
- [x] `.env.local` git 미추적 확인 → GitHub push 완료
- [x] **Vercel 배포 완료** — https://jiwongeum-radar-mvp.vercel.app (프로덕션 E2E 재검증 완료, grant sync까지 확인)
- [x] Vercel 환경변수 등록 완료 (Supabase 3종, Anthropic, 리틀리 2종, K-Startup, 기업마당, CRON_SECRET — 총 9개)
- [x] **GitHub 저장소를 Public으로 전환** — Vercel이 이 계정에서 개인 스코프를 지원하지 않아("personal_scope_not_allowed") 팀 멤버십 문제로 배포가 막혔던 것을 해결. 비밀키는 `.env.local`이라 git에 없어 노출 없음. Pro 업그레이드(유료) 대신 이 방법으로 무료 해결
- [ ] **키 회전**(service_role, Anthropic) — 로컬 개발 중 사용한 키는 실제 고객 받기 전 재발급 권장
- [ ] Supabase Site URL = `https://jiwongeum-radar-mvp.vercel.app`

## Phase 9 — 실결제 검수 ✅ AI 분석 직전까지 통과
- [x] 실제 결제 1건 → 진짜 주문번호로 가입→승인까지 확인 (AI 분석 단계는 크레딧 문제로 대기)
- [x] 같은 주문번호 재사용 시 차단 확인
- [x] Starter 재구매 시 만료일 연장 확인
- [ ] 테스트 결제 환불 (AI 분석까지 끝까지 확인 후 진행 권장)

## 백로그 (이번 MVP 범위 아님)
- Builder(신청준비방 7탭), Diagnostic/Deep 단건결제, Season Pass
- D-day 플래너, 사업계획서 작성 보조 전체
- 리틀리 정기결제 API 연동(있다면) — 현재는 재구매 방식
- 주문번호 자동 등록(리틀리 알림 파싱) — 결제량 늘면 필요
- 기업마당 industry_scope/region_scope 필드 정교화 (현재는 대분류만 반영)
