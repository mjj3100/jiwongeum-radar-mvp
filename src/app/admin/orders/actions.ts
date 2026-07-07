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
