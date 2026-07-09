import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { claimOrder } from '@/lib/claim-order'
import { AppShell } from '@/components/AppShell'
import { PendingRetryForm } from './PendingRetryForm'
import { isAdminEmail } from '@/lib/admin-auth'

export default async function PendingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/login')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('status, pending_order_no')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.status === 'active') {
    redirect('/result')
  }

  // 방문할 때마다 자동으로 재클레임을 시도한다 — 운영자가 그 사이 orders에
  // 등록해뒀다면 사용자가 아무것도 안 해도 바로 풀린다.
  if (profile?.pending_order_no) {
    const result = await claimOrder(admin, user.email, profile.pending_order_no)
    if (result === 'approved') {
      redirect('/result')
    }
  }

  return (
    <AppShell isAdmin={isAdminEmail(user.email)} userEmail={user.email}>
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-extrabold text-navy-900">결제 확인 중이에요</h1>
        <p className="text-base text-neutral-600">
          주문번호가 아직 확인되지 않았어요. 결제 후 확인까지 시간이 조금 걸릴 수 있으니,
          잠시 후 이 페이지를 새로고침해보시거나 아래에서 다시 확인해주세요. 주문번호를
          잘못 입력하셨다면 아래에 다시 입력하시면 됩니다.
        </p>
        <PendingRetryForm defaultOrderNo={profile?.pending_order_no ?? ''} />
      </div>
    </AppShell>
  )
}
