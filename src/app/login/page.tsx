'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/AuthLayout'
import { BrandHeader } from '@/components/BrandHeader'
import { login } from './actions'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await login(formData)
    return result ?? initialState
  }, initialState)

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden">
        <BrandHeader />
      </div>
      <h1 className="text-3xl font-extrabold text-navy-900">로그인</h1>
      <form action={formAction} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-navy-900">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-navy-900">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input mt-1.5"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="mt-6 text-base text-neutral-500">
        아직 가입 전이신가요?{' '}
        <Link href="/signup" className="font-bold text-teal-dark underline">
          결제 후 가입하기
        </Link>
      </p>
    </AuthLayout>
  )
}
