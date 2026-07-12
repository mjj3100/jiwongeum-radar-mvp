'use client'

import { useActionState } from 'react'
import { createOrder } from './actions'

const initialState = { error: '', success: false }

export function CreateOrderForm() {
  const [state, formAction, pending] = useActionState(createOrder, initialState)

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="order_no" className="block text-sm font-semibold text-navy-900">
          주문번호 (16자리)
        </label>
        <input
          id="order_no"
          name="order_no"
          required
          inputMode="numeric"
          placeholder="0000000000000000"
          className="input mt-1.5"
        />
      </div>
      <div>
        <label htmlFor="product" className="block text-sm font-semibold text-navy-900">
          상품
        </label>
        <select id="product" name="product" required defaultValue="scan" className="input mt-1.5">
          <option value="scan">scan (SCAN 9,900원)</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-teal-dark">등록 완료했어요.</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
        {pending ? '등록 중...' : '주문번호 등록'}
      </button>
    </form>
  )
}
