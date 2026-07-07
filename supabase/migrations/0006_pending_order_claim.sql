-- 0006_pending_order_claim.sql — 가입과 주문번호 클레임 분리
--
-- 지금까지는 orders에 주문번호가 아직 없으면(운영자가 리틀리 알림을 보고
-- 수동 등록하기 전) 회원가입 자체가 "주문번호를 찾을 수 없습니다" 에러로
-- 막혔다. 결제 직후 바로 가입을 시도하는 고객 입장에서는 정상적인 결제인데도
-- 계속 실패하는 것으로 보인다.
--
-- 형식은 유효한데 orders에 아직 없는 경우, 계정은 만들고 시도한 주문번호를
-- pending_order_no에 저장해둔다. 운영자가 나중에 orders에 등록하면 다음 방문
-- (/pending)에서 자동으로 재클레임을 시도해 승인된다.

alter table profiles
  add column pending_order_no text;
