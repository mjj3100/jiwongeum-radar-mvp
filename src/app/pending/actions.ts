'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidOrderNo, normalizeOrderNo } from '@/lib/order-format'
import { claimOrder, CLAIM_MESSAGES } from '@/lib/claim-order'

export async function retryClaim(formData: FormData): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/login')
  }

  const orderNoRaw = String(formData.get('order_no') || '')
  if (!isValidOrderNo(orderNoRaw)) {
    return { error: '주문번호는 숫자 16자리입니다. 다시 확인해주세요.' }
  }

  const admin = createAdminClient()
  const orderNo = normalizeOrderNo(orderNoRaw)
  const result = await claimOrder(admin, user.email, orderNo)

  if (result === 'approved') {
    redirect('/result')
  }

  return { error: CLAIM_MESSAGES[result] }
}
