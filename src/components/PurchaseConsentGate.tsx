'use client'

import { useId, useState } from 'react'

/**
 * 결제 전 필수 고지(청약철회 제한·환불 규칙) + 동의 체크 없이는 리틀리 결제 링크로
 * 넘어갈 수 없게 막는 게이트. 디지털 콘텐츠 환불 제한은 "제공 개시 전 명시 고지 + 동의"가
 * 있어야 법적으로 유효하다.
 */
export function PurchaseConsentGate({
  href,
  label,
  variant = 'primary',
}: {
  href: string
  label: string
  variant?: 'primary' | 'outline'
}) {
  const [agreed, setAgreed] = useState(false)
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-2.5 text-left text-xs leading-relaxed text-neutral-500">
        <input
          id={id}
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-teal-dark focus:ring-teal"
        />
        <span>
          진단 결과 발급 후에는 환불이 제한되며, 재진단은 결제한 상품의 규칙(동일 공고·마감일 한정)을
          따른다는 점에 동의합니다.
        </span>
      </label>
      <a
        href={agreed ? href : undefined}
        aria-disabled={!agreed}
        onClick={(e) => {
          if (!agreed) e.preventDefault()
        }}
        className={`mt-4 block w-full text-center text-base ${
          variant === 'primary' ? 'btn-primary' : 'btn-outline'
        } ${!agreed ? 'pointer-events-none opacity-40' : ''}`}
      >
        {label}
      </a>
    </div>
  )
}
