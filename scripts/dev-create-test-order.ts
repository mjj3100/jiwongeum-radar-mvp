/**
 * 개발/QA용: 리틀리 결제 없이 테스트 주문번호를 orders 테이블에 미리 등록한다.
 * 실제로는 운영자가 리틀리 결제 확인 후 이 작업을 수동으로 한다 (spec.md §3-7).
 *
 * 사용법:
 *   npx tsx --env-file=.env.local scripts/dev-create-test-order.ts <16자리주문번호> <bundle|starter>
 */
import { createClient } from '@supabase/supabase-js'

const [, , orderNo, product] = process.argv

if (!orderNo || !/^\d{16}$/.test(orderNo)) {
  console.error('사용법: npx tsx --env-file=.env.local scripts/dev-create-test-order.ts <16자리숫자> <bundle|starter>')
  process.exit(1)
}
if (product !== 'bundle' && product !== 'starter') {
  console.error('product는 bundle 또는 starter여야 합니다.')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { error } = await supabase.from('orders').insert({
    order_no: orderNo,
    product,
    payment_email: null,
    amount: null,
  })

  if (error) {
    console.error('생성 실패:', error.message)
    process.exit(1)
  }

  console.log(`테스트 주문번호 등록 완료: ${orderNo} (${product})`)
}

main()
