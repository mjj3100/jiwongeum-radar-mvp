'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin-auth'
import { isValidOrderNo, normalizeOrderNo } from '@/lib/order-format'

export async function createOrder(
  _prev: { error: string; success: boolean },
  formData: FormData
): Promise<{ error: string; success: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    redirect('/login')
  }

  const orderNoRaw = String(formData.get('order_no') || '')
  const product = String(formData.get('product') || '')

  if (!isValidOrderNo(orderNoRaw)) {
    return { error: '주문번호는 숫자 16자리입니다.', success: false }
  }
  if (product !== 'bundle' && product !== 'starter') {
    return { error: '상품 종류를 선택해주세요.', success: false }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('orders').insert({
    order_no: normalizeOrderNo(orderNoRaw),
    product,
  })

  if (error) {
    return {
      error: error.code === '23505' ? '이미 등록된 주문번호입니다.' : '등록에 실패했습니다: ' + error.message,
      success: false,
    }
  }

  revalidatePath('/admin/orders')
  return { error: '', success: true }
}

/**
 * 환불 등으로 주문을 취소할 때 사용한다. 이미 클레임된 주문이면 orders 행만 지워서는
 * 이용권이 남아있으므로, 해당 상품의 entitlements도 함께 회수한다.
 */
export async function deleteOrder(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    redirect('/login')
  }

  const orderNo = String(formData.get('order_no') || '')
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('claimed_by, product')
    .eq('order_no', orderNo)
    .maybeSingle()

  if (order?.claimed_by) {
    await admin
      .from('entitlements')
      .delete()
      .eq('user_id', order.claimed_by)
      .eq('product', order.product)

    // 남은 이용권이 하나도 없으면 profiles.status도 pending으로 되돌린다.
    // 그래야 /pending이 "이미 active"로 오판해 /result와 무한 리다이렉트에
    // 빠지지 않는다.
    const { data: remaining } = await admin
      .from('entitlements')
      .select('product')
      .eq('user_id', order.claimed_by)

    if (!remaining || remaining.length === 0) {
      await admin.from('profiles').update({ status: 'pending' }).eq('id', order.claimed_by)
    }
  }

  await admin.from('orders').delete().eq('order_no', orderNo)

  revalidatePath('/admin/orders')
}
