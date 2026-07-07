import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ClaimResult = 'approved' | 'order_used' | 'no_account' | 'no_order'

export const CLAIM_MESSAGES: Record<Exclude<ClaimResult, 'approved'>, string> = {
  order_used: '이미 사용된 주문번호입니다. 결제 시 받은 주문번호를 다시 확인해주세요.',
  no_account: '가입 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
  no_order: '아직 결제 확인이 안 된 주문번호예요. 잠시 후 다시 시도해주세요.',
}

/**
 * claim_order RPC를 호출하고, 결과에 따라 profiles.pending_order_no를 갱신한다.
 * no_order(=orders에 아직 없음)면 나중에 /pending에서 자동 재시도할 수 있도록
 * 시도한 주문번호를 저장해두고, approved면 지운다.
 */
export async function claimOrder(
  admin: SupabaseClient,
  email: string,
  orderNo: string
): Promise<ClaimResult> {
  const { data, error } = await admin.rpc('claim_order', {
    p_order_no: orderNo,
    p_signup_email: email,
  })

  const result: ClaimResult = !error && typeof data === 'string' ? (data as ClaimResult) : 'no_order'

  if (result === 'approved') {
    await admin.from('profiles').update({ pending_order_no: null }).eq('email', email)
  } else if (result === 'no_order') {
    await admin.from('profiles').update({ pending_order_no: orderNo }).eq('email', email)
  }

  return result
}
