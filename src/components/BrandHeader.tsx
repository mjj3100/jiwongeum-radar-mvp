import Link from 'next/link'
import { RadarLogo } from './RadarLogo'

export function BrandHeader({ isAdmin }: { isAdmin?: boolean } = {}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <RadarLogo size={32} />
        <span className="text-base font-bold text-navy-900">지원금 레이더</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin/orders"
          className="rounded-md border border-navy-900/15 px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
        >
          관리자
        </Link>
      )}
    </div>
  )
}
