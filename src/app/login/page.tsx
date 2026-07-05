'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { BrandHeader } from '@/components/BrandHeader'
import { login } from './actions'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await login(formData)
    return result ?? initialState
  }, initialState)

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <BrandHeader />
      <h1 className="mt-8 text-2xl font-bold text-navy-900">로그인</h1>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy-900">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input mt-1"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy-900">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input mt-1"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500">
        아직 가입 전이신가요?{' '}
        <Link href="/signup" className="font-medium text-teal-dark underline">
          결제 후 가입하기
        </Link>
      </p>
    </main>
  )
}
