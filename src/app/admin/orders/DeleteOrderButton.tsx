'use client'

import { useTransition } from 'react'
import { deleteOrder } from './actions'

export function DeleteOrderButton({ orderNo, claimed }: { orderNo: string; claimed: boolean }) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    const message = claimed
      ? '이미 사용된 주문번호예요. 삭제하면 해당 계정의 이용권도 함께 회수됩니다. 계속할까요? (환불 처리용)'
      : '이 주문번호를 삭제할까요?'
    if (!window.confirm(message)) return

    const formData = new FormData()
    formData.set('order_no', orderNo)
    startTransition(() => {
      deleteOrder(formData)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? '처리 중...' : '삭제'}
    </button>
  )
}
