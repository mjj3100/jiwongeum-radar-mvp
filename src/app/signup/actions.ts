'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidOrderNo, normalizeOrderNo } from '@/lib/order-format'
import { claimOrder, CLAIM_MESSAGES } from '@/lib/claim-order'

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

  // 이미 클레임된 주문번호는 가입 전에 미리 막는다 — 그대로 계정을 만들면
  // 영구히 승인 안 되는 상태로 남기 때문에, 이 경우만은 사전 차단한다.
  const { data: existingOrder } = await admin
    .from('orders')
    .select('claimed_by')
    .eq('order_no', orderNo)
    .maybeSingle()

  if (existingOrder?.claimed_by) {
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

  // 주문번호가 아직 orders에 등록되지 않았을 수 있다(운영자가 결제 알림을 보고
  // 등록하기 전). 이 경우도 계정은 이미 만들어졌으니 에러로 막지 않고 승인 대기로
  // 보낸다 — claimOrder가 pending_order_no를 저장해두면 /pending에서 자동 재시도한다.
  const result = await claimOrder(admin, email, orderNo)

  if (result === 'approved') {
    redirect('/result')
  }

  redirect('/pending')
}
