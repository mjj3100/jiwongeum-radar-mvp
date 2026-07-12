-- 0008_match_results_report_fields.sql — 리포트형 리디자인: 자격판정/원문인용/서류체크리스트 추가
--
-- 9,900원 결과 화면을 리포트 형식(자격판정/원문인용/서류체크리스트 포함)으로 맞추면서
-- match_results에 컬럼 3개를 추가한다.
-- quote_excerpt는 Claude가 새로 쓴 문장이 아니라 공고 원문에서 그대로 발췌한 문장이므로
-- 가드레일 sanitize(containsBannedPhrase) 대상이 아니다 — src/lib/anthropic/analyze.ts의
-- verifyQuote()가 원문 포함 여부만 별도로 검증한다.
--
-- 형식:
--   eligibility_checks: [{"status": "충족"|"주의"|"미충족", "label": string, "detail": string}, ...]
--   required_documents: [string, ...]

alter table match_results
  add column eligibility_checks jsonb,
  add column quote_excerpt text,
  add column required_documents jsonb;
