import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

export function AppShell({ children, isAdmin }: { children: React.ReactNode; isAdmin?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-teal-tint/50 via-white to-white">
      <header className="border-b border-navy-900/5 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <BrandHeader isAdmin={isAdmin} />
        </div>
      </header>
      <main className="flex-1 px-6 py-14">{children}</main>
      <SiteFooter />
    </div>
  )
}
