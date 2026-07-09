import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin-auth'
import { AppShell } from '@/components/AppShell'
import { CreateOrderForm } from './CreateOrderForm'
import { DeleteOrderButton } from './DeleteOrderButton'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) {
    redirect('/login')
  }

  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('order_no, product, claimed_by, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <AppShell isAdmin userEmail={user?.email}>
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <p className="eyebrow text-teal-dark">ADMIN</p>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900">주문번호 등록</h1>
          <p className="mt-2 text-base text-neutral-500">
            리틀리 결제 알림을 받으면 여기서 주문번호+상품종류를 등록하세요. 가입 대기 중인
            고객이 있다면 다음 방문 시 자동으로 승인됩니다.
          </p>
        </div>

        <CreateOrderForm />

        <section>
          <h2 className="text-base font-bold text-neutral-500">최근 주문 20건</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400">
                  <th className="px-4 py-2 font-semibold">주문번호</th>
                  <th className="px-4 py-2 font-semibold">상품</th>
                  <th className="px-4 py-2 font-semibold">상태</th>
                  <th className="px-4 py-2 font-semibold">등록일</th>
                  <th className="px-4 py-2 font-semibold">관리</th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((o) => (
                  <tr key={o.order_no} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2 font-mono">{o.order_no}</td>
                    <td className="px-4 py-2">{o.product}</td>
                    <td className="px-4 py-2">{o.claimed_by ? '사용됨' : '대기'}</td>
                    <td className="px-4 py-2 text-neutral-400">
                      {new Date(o.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-2">
                      <DeleteOrderButton orderNo={o.order_no} claimed={Boolean(o.claimed_by)} />
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                      등록된 주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
