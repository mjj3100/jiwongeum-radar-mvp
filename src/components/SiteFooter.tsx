import Link from 'next/link'

/**
 * 사업자정보(상호·대표자·사업자등록번호·통신판매업 신고번호)는 등록 전이라 표시하지 않는다.
 * 리틀리 상품 5종 등록·통신판매업 신고와 함께 MVP(29,900원 티어) 개발 완료 후 채워 넣을 것.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-10 text-sm text-neutral-400">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:text-neutral-600 hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-neutral-600 hover:underline">
            이용약관
          </Link>
          <Link href="/faq" className="hover:text-neutral-600 hover:underline">
            자주 묻는 질문
          </Link>
        </div>
        <p className="mt-4">
          문의: 오픈카톡 준비 중 (등록 후 이 자리에 링크가 표시됩니다)
        </p>
        <p className="mt-1">© 지원금 레이더</p>
      </div>
    </footer>
  )
}
