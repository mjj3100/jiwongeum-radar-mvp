import Link from 'next/link'
import { RadarLogo } from './RadarLogo'

export function BrandHeader() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <RadarLogo size={32} />
      <span className="text-base font-bold text-navy-900">지원금 레이더</span>
    </Link>
  )
}
