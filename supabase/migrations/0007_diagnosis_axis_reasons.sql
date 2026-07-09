-- 0007_diagnosis_axis_reasons.sql — 4축 진단에 축별 사유 추가
--
-- 지금까지는 관련성/구체성/차별성/실현가능성 점수만 있고 "왜 이 점수인지"를
-- 설명하는 텍스트가 없어, 사용자가 점수만 보고 무엇을 고쳐야 할지 알기 어려웠다.
-- 축마다 짧은 사유 문장을 저장할 jsonb 컬럼을 추가한다.
-- 형식: {"relevance": string, "concreteness": string, "differentiation": string, "feasibility": string}

alter table diagnosis_reports
  add column axis_reasons jsonb;
