-- 0002_claim_order.sql — 주문번호 클레임 RPC (구독 연장 지원)
--
-- 전제: orders 테이블에 리틀리 결제 확인 후 운영자가 미리
-- (order_no, product, payment_email, amount)를 insert해둔다.
-- claim_order는 "존재하는 미클레임 주문번호에 claimed_by를 채우는" 역할만 한다.
--
-- 반환값: approved | order_used | no_account | no_order

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
  v_current_expiry timestamptz;
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

  if v_product = 'bundle' then
    insert into entitlements (user_id, product, expires_at)
      values (v_user_id, 'bundle', null)
      on conflict (user_id, product) do nothing;
    update profiles set status = 'active' where id = v_user_id;

  elsif v_product = 'starter' then
    select expires_at into v_current_expiry
      from entitlements where user_id = v_user_id and product = 'starter';

    insert into entitlements (user_id, product, expires_at)
      values (v_user_id, 'starter', greatest(now(), coalesce(v_current_expiry, now())) + interval '30 days')
      on conflict (user_id, product) do update
        set expires_at = greatest(now(), coalesce(entitlements.expires_at, now())) + interval '30 days';

    update profiles set status = 'active' where id = v_user_id;
  end if;

  return 'approved';
end;
$$;

revoke all on function claim_order(text, text, text) from public, anon, authenticated;
grant execute on function claim_order(text, text, text) to service_role;
