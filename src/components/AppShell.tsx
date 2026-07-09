import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'
import { RadarGlow } from './RadarLogo'

export function AppShell({
  children,
  isAdmin,
  userEmail,
}: {
  children: React.ReactNode
  isAdmin?: boolean
  userEmail?: string | null
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-teal-tint/50 via-white to-white">
      <RadarGlow className="pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] opacity-60" />
      <header className="relative border-b border-navy-900/5 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <BrandHeader isAdmin={isAdmin} userEmail={userEmail} />
        </div>
      </header>
      <main className="relative flex-1 px-6 py-14">{children}</main>
      <SiteFooter />
    </div>
  )
}
