-- 0009_scan_tier_rename.sql — bundle→scan 리네이밍 + starter 폐기 + 재진단 카운터
--
-- 실제 마케팅 랜딩(jiwongeum-radar-landing-deploy)이 이미 상품을 SCAN(9,900)/LOCK-ON(19,900)/
-- FULL RADAR(29,900)로 브랜딩해 판매 중이라, 코드의 'bundle' 명칭을 실제 판매명 'scan'으로
-- 맞춘다. 구독형 'starter'는 리틀리가 정기결제를 지원하지 않아 폐기하기로 확정했고(실보유자 0명),
-- product CHECK에서 완전히 제거한다. lockon/fullradar는 실제 판매 시작 시 별도 마이그레이션으로
-- 추가한다.
--
-- 재진단 남용 방지를 위해 business_profiles에 analysis_count를 추가한다. SCAN은 첫 진단 포함
-- 총 3회까지만 재분석 가능(런타임 체크는 src/lib/analyze-service.ts).

-- 기존 제약(bundle/starter만 허용)을 먼저 풀어야 'scan' 값으로 업데이트할 수 있다.
alter table orders drop constraint orders_product_check;
alter table entitlements drop constraint entitlements_product_check;

update orders set product = 'scan' where product = 'bundle';
update entitlements set product = 'scan' where product = 'bundle';

alter table orders add constraint orders_product_check check (product = 'scan');
alter table entitlements add constraint entitlements_product_check check (product = 'scan');

alter table business_profiles add column analysis_count int not null default 0;
