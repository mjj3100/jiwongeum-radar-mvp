'use client'

import { useEffect, useState } from 'react'

/** 스크롤 160px 이상 시 나타나는 모바일 하단 고정 CTA — landing-deploy와 동일한 UX. */
export function MobileStickyCta({ href }: { href: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 160)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-navy-900/10 bg-white/95 px-4 py-2.5 backdrop-blur transition-transform duration-200 sm:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
    >
      <a href={href} className="btn-primary block w-full text-center text-base">
        3분 진단 시작 · 9,900원
      </a>
    </div>
  )
}
