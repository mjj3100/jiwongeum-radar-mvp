'use client'

import { useActionState } from 'react'
import { submitBusinessProfile } from './actions'
import type { BusinessProfileInput } from '@/lib/types'

const initialState = { error: '' }

export function BusinessProfileForm({ defaultValues }: { defaultValues?: BusinessProfileInput }) {
  const [state, formAction, pending] = useActionState(async (_: typeof initialState, formData: FormData) => {
    const result = await submitBusinessProfile(formData)
    return result ?? initialState
  }, initialState)

  const isEdit = Boolean(defaultValues)

  return (
    <form
      action={formAction}
      className="mx-auto max-w-lg space-y-5 rounded-2xl border border-navy-900/10 bg-white p-8 shadow-[0_12px_40px_rgba(10,19,48,0.06)] sm:p-10"
    >
      <div>
        <p className="eyebrow text-teal-dark">{isEdit ? 'EDIT PROFILE' : 'BUSINESS PROFILE'}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy-900">
          {isEdit ? '사업 정보를 수정해주세요' : '사업 정보를 입력해주세요'}
        </h1>
        <p className="mt-2 text-base text-neutral-500">
          최소한의 정보로 맞춤 공고 3~5개와 1순위 공고 미니 진단을 만들어드립니다.
        </p>
      </div>

      <Field label="사업자 상태">
        <select name="founder_status" required defaultValue={defaultValues?.founder_status ?? ''} className="input">
          <option value="">선택</option>
          <option value="예비창업자">예비창업자</option>
          <option value="개인사업자">개인사업자</option>
          <option value="법인사업자">법인사업자</option>
          <option value="소상공인">소상공인</option>
        </select>
      </Field>

      <p className="text-xs text-neutral-400">
        연령대·성별은 청년창업·여성창업·중장년 지원사업 판별에만 활용됩니다.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="연령대">
          <select name="age_group" required defaultValue={defaultValues?.age_group ?? ''} className="input">
            <option value="">선택</option>
            <option value="20대이하">20대 이하</option>
            <option value="30대">30대</option>
            <option value="40대">40대</option>
            <option value="50대이상">50대 이상</option>
          </select>
        </Field>

        <Field label="성별">
          <select name="gender" required defaultValue={defaultValues?.gender ?? ''} className="input">
            <option value="">선택</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="비공개">비공개</option>
          </select>
        </Field>
      </div>

      <Field label="사업장 소재지 (예: 서울 마포구)">
        <input name="region" required placeholder="서울 마포구" defaultValue={defaultValues?.region} className="input" />
      </Field>

      <Field label="업종 (예: 카페, 온라인몰, SaaS)">
        <input name="industry" required placeholder="카페" defaultValue={defaultValues?.industry} className="input" />
      </Field>

      <Field label="창업일 (예비창업자는 비워두세요)">
        <input name="founded_date" type="date" defaultValue={defaultValues?.founded_date ?? ''} className="input" />
      </Field>

      <Field label="연매출 구간">
        <select name="revenue_band" required defaultValue={defaultValues?.revenue_band ?? ''} className="input">
          <option value="">선택</option>
          <option value="없음">없음</option>
          <option value="5천만미만">5천만 미만</option>
          <option value="1억미만">1억 미만</option>
          <option value="3억미만">3억 미만</option>
          <option value="3억이상">3억 이상</option>
        </select>
      </Field>

      <Field label="직원 수">
        <select name="employee_count" required defaultValue={defaultValues?.employee_count ?? ''} className="input">
          <option value="">선택</option>
          <option value="1인">1인</option>
          <option value="2~4명">2~4명</option>
          <option value="5명이상">5명 이상</option>
        </select>
      </Field>

      <Field label="사업 아이템 한 줄 설명">
        <textarea
          name="item_description"
          required
          rows={2}
          placeholder="예: 네이버플레이스·배달앱 리뷰를 분석해 반복 불만과 홍보 소재를 찾아주는 리포트 서비스"
          defaultValue={defaultValues?.item_description}
          className="input"
        />
      </Field>

      <Field label="필요한 지원">
        <select name="support_needed" required defaultValue={defaultValues?.support_needed ?? ''} className="input">
          <option value="">선택</option>
          <option value="사업화자금">사업화자금</option>
          <option value="개발비">개발비</option>
          <option value="광고비">광고비</option>
          <option value="장비">장비</option>
          <option value="공간">공간</option>
          <option value="정책자금">정책자금</option>
        </select>
      </Field>

      <Field label="준비 상태">
        <select name="readiness" required defaultValue={defaultValues?.readiness ?? ''} className="input">
          <option value="">선택</option>
          <option value="아이디어">아이디어</option>
          <option value="MVP">MVP</option>
          <option value="매출발생">매출 발생</option>
          <option value="제출직전">제출 직전</option>
        </select>
      </Field>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
        {pending ? '분석 중... (최대 30초)' : isEdit ? '수정하고 다시 진단받기' : '맞춤 공고 + 미니 진단 받기'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-navy-900">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
