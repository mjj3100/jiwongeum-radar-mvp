'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/AuthLayout'
import { BrandHeader } from '@/components/BrandHeader'
import { signup } from './actions'

const initialState = { error: '' }

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await signup(formData)
    return result ?? initialState
  }, initialState)

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <BrandHeader />
      </div>
      <h1 className="text-3xl font-extrabold text-navy-900">결제 후 가입</h1>
      <p className="mt-3 text-base text-neutral-500">
        결제완료 화면 또는 카카오 알림톡에 표시된 주문번호 16자리를 입력하면 즉시 승인됩니다.
      </p>
      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-navy-900">이메일</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input mt-1.5" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-navy-900">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="order_no" className="block text-sm font-semibold text-navy-900">주문번호 (16자리)</label>
          <input
            id="order_no"
            name="order_no"
            required
            inputMode="numeric"
            placeholder="0000000000000000"
            className="input mt-1.5"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? '확인 중...' : '가입하고 바로 시작하기'}
        </button>
      </form>
      <p className="mt-6 text-base text-neutral-500">
        이미 가입하셨나요? <Link href="/login" className="font-bold text-teal-dark underline">로그인</Link>
      </p>
    </AuthLayout>
  )
}
