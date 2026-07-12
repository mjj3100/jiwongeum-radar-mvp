-- 0010_claim_order_scan.sql — claim_order를 scan 단일 상품 기준으로 수정
--
-- 0009에서 orders/entitlements의 product 값을 bundle→scan으로 옮기고 starter를 폐기했지만,
-- claim_order 함수 자체는 여전히 'bundle'/'starter' 분기라 새 주문(product='scan')이 들어오면
-- 두 분기 모두 안 걸려 entitlements가 생성되지 않은 채 무조건 'approved'를 반환하는 심각한
-- 버그가 있었다(신규 고객이 결제→가입해도 이용권이 없어 /pending으로 계속 튕기는 상태가 됨).
-- scan은 bundle과 동일하게 1회성 영구 이용권(expires_at=null)으로 부여한다.

create or replace function claim_order(
  p_order_no text,
  p_signup_email text,
  p_payment_email text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_product text;
  v_order_id uuid;
begin
  if p_order_no is null or trim(p_order_no) = '' then
    return 'no_order';
  end if;

  select id into v_user_id from profiles where email = p_signup_email;
  if v_user_id is null then
    return 'no_account';
  end if;

  select id, product into v_order_id, v_product
    from orders
    where order_no = trim(p_order_no) and claimed_by is null;

  if v_order_id is null then
    if exists (select 1 from orders where order_no = trim(p_order_no) and claimed_by is not null) then
      return 'order_used';
    end if;
    return 'no_order';
  end if;

  update orders set claimed_by = v_user_id, claimed_at = now() where id = v_order_id;

  if v_product = 'scan' then
    insert into entitlements (user_id, product, expires_at)
      values (v_user_id, 'scan', null)
      on conflict (user_id, product) do nothing;
    update profiles set status = 'active' where id = v_user_id;
  end if;

  return 'approved';
end;
$$;

revoke all on function claim_order(text, text, text) from public, anon, authenticated;
grant execute on function claim_order(text, text, text) to service_role;
