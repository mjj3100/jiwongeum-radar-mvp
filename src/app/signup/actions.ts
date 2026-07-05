'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidOrderNo, normalizeOrderNo } from '@/lib/order-format'

const CLAIM_MESSAGES: Record<string, string> = {
  order_used: '이미 사용된 주문번호입니다. 결제 시 받은 주문번호를 다시 확인해주세요.',
  no_account: '가입 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
  no_order: '주문번호를 찾을 수 없습니다. 결제완료 화면 또는 카카오 알림톡의 16자리 번호를 확인해주세요.',
}

export async function signup(formData: FormData): Promise<{ error: string } | never> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const orderNoRaw = String(formData.get('order_no') || '')

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  if (!isValidOrderNo(orderNoRaw)) {
    return { error: '주문번호는 숫자 16자리입니다. 결제완료 화면의 번호를 다시 확인해주세요.' }
  }

  const orderNo = normalizeOrderNo(orderNoRaw)
  const admin = createAdminClient()

  // signUp 전에 주문번호 유효성을 먼저 확인한다. 이렇게 하지 않으면 오탈자 주문번호로
  // 계정만 생성되고 claim은 실패해, 같은 이메일로 재시도 시 "이미 가입됨"에 막히는
  // 데드락이 생긴다. (claim_order 자체의 원자적 클레임은 아래에서 그대로 수행한다.)
  const { data: existingOrder } = await admin
    .from('orders')
    .select('claimed_by')
    .eq('order_no', orderNo)
    .maybeSingle()

  if (!existingOrder) {
    return { error: CLAIM_MESSAGES.no_order }
  }
  if (existingOrder.claimed_by) {
    return { error: CLAIM_MESSAGES.order_used }
  }

  const supabase = await createClient()
  const { error: signUpError } = await supabase.auth.signUp({ email, password })

  if (signUpError) {
    return {
      error: signUpError.message.includes('already registered')
        ? '이미 가입된 이메일입니다. 로그인 후 이용해주세요.'
        : '가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
    }
  }

  // claim_order는 service_role 전용 RPC이므로 admin 클라이언트로 호출한다.
  const { data, error: rpcError } = await admin.rpc('claim_order', {
    p_order_no: orderNo,
    p_signup_email: email,
  })

  if (rpcError || data !== 'approved') {
    const code = typeof data === 'string' ? data : 'no_order'
    return { error: CLAIM_MESSAGES[code] ?? '주문번호 확인에 실패했습니다.' }
  }

  redirect('/result')
}
