'use client'

import { useActionState } from 'react'
import { retryClaim } from './actions'

const initialState = { error: '' }

export function PendingRetryForm({ defaultOrderNo }: { defaultOrderNo: string }) {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await retryClaim(formData)
    return result ?? initialState
  }, initialState)

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-navy-900/10 bg-white p-6 text-left shadow-sm"
    >
      <label htmlFor="order_no" className="block text-sm font-semibold text-navy-900">
        주문번호 (16자리)
      </label>
      <input
        id="order_no"
        name="order_no"
        required
        inputMode="numeric"
        defaultValue={defaultOrderNo}
        placeholder="0000000000000000"
        className="input"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
        {pending ? '확인 중...' : '다시 확인하기'}
      </button>
    </form>
  )
}
