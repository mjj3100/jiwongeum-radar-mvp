import { RadarLogo, RadarGlow } from './RadarLogo'

const TRUST_POINTS = [
  '맞춤 지원사업 후보 3~5개 진단',
  '1순위 공고 미니 4축 예비진단',
  '결제 1회로 즉시 확인',
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1">
      {/* 좌측 브랜드 패널 (데스크톱만) */}
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between">
        <RadarGlow className="absolute -left-32 -top-24 h-[520px] w-[520px] opacity-80" />
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2.5">
            <RadarLogo size={36} />
            <span className="text-lg font-bold text-white">지원금 레이더</span>
          </div>
        </div>
        <div className="relative z-10 p-12">
          <p className="eyebrow text-teal">AI 지원사업 신청 준비 OS</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight text-white">
            지원사업, <span className="text-teal">찾는 것</span>에서
            <br />
            끝나지 않게.
          </h2>
          <ul className="mt-8 space-y-3">
            {TRUST_POINTS.map((t) => (
              <li key={t} className="flex items-center gap-3 text-base text-lavender">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15 text-xs font-bold text-teal">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 p-12 text-xs text-slate">© 지원금 레이더</div>
      </div>

      {/* 우측 폼 패널 */}
      <div className="flex flex-1 items-center justify-center bg-neutral-50 px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
