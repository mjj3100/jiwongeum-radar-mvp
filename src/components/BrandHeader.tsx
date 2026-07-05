import Link from 'next/link'
import { RadarLogo } from './RadarLogo'

export function BrandHeader() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <RadarLogo size={24} />
      <span className="text-sm font-bold text-navy-900">지원금 레이더</span>
    </Link>
  )
}
