import { BrandHeader } from './BrandHeader'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-tint/50 via-white to-white">
      <header className="border-b border-navy-900/5 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <BrandHeader />
        </div>
      </header>
      <main className="px-6 py-14">{children}</main>
    </div>
  )
}
