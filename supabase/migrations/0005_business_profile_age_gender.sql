-- 0005_business_profile_age_gender.sql — 나이대/성별 항목 추가
--
-- 전자책 이전 오픈카톡 프로세스에서 받던 항목("청년창업/여성창업/중장년 지원사업"
-- 판별용)을 웹 폼에도 추가한다. 기존 행이 있을 수 있어 nullable로 추가하고,
-- 신규 제출부터는 애플리케이션 레벨에서 필수값으로 강제한다.

alter table business_profiles
  add column age_group text,
  add column gender text;
