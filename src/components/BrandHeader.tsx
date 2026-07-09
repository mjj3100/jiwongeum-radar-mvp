import Link from 'next/link'
import { RadarLogo } from './RadarLogo'
import { signOut } from '@/lib/auth-actions'

export function BrandHeader({
  isAdmin,
  userEmail,
}: { isAdmin?: boolean; userEmail?: string | null } = {}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <RadarLogo size={32} />
        <span className="text-base font-bold text-navy-900">지원금 레이더</span>
      </Link>
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin/orders"
            className="rounded-md border border-navy-900/15 px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
          >
            관리자
          </Link>
        )}
        {userEmail && (
          <>
            <Link
              href="/result"
              className="rounded-md border border-teal-dark/30 px-3 py-1.5 text-sm font-semibold text-teal-dark hover:bg-teal-tint"
            >
              내 결과
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-neutral-500 hover:bg-navy-900/5"
              >
                로그아웃
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
