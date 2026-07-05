import Link from 'next/link'
import { RadarLogo, RadarGlow } from '@/components/RadarLogo'
import { LITTLY_URL_BUNDLE, LITTLY_URL_STARTER, PRICING } from '@/lib/constants'

const FRICTION_POINTS = [
  '이 공고, 내가 신청 가능한가? 자격 해석이 어렵다',
  '준비서류가 뭔지 헷갈린다. 공고마다 다르고 누락되기 쉽다',
  'AI 초안은 있는데 그대로 내도 되는지 불안하다',
  '마감 임박인데 무엇부터 손대야 할지 모른다',
]

const REASONS = [
  '내가 안 찾아도 공고가 들어온다',
  '많이 보여주지 않고 3~5개만 좁힌다',
  '왜 추천·왜 조심해야 하는지 둘 다 알려준다',
  '제출 직전 빠진 구멍과 위험 문장을 잡는다',
]

const STATS = [
  { value: '3~5개', label: '맞춤 공고 후보 진단' },
  { value: '4축', label: '제출 전 예비진단' },
  { value: '1회', label: '결제로 즉시 확인' },
]

export default function LandingPage() {
  return (
    <main>
      {/* HERO — 다크 네이비 + 레이더 글로우 */}
      <section className="relative overflow-hidden bg-navy-950">
        <RadarGlow className="pointer-events-none absolute -right-32 -top-24 h-[560px] w-[560px] opacity-80 sm:-right-16" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <div className="flex items-center justify-center gap-2">
            <RadarLogo size={32} />
            <span className="text-lg font-bold text-white">지원금 레이더</span>
          </div>
          <p className="eyebrow mt-6 text-teal">AI 지원사업 신청 준비 OS</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            지원사업, <span className="text-teal">찾는 것</span>에서
            <br />
            끝나지 않게.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-lavender">
            예비창업자·초기창업자·소상공인이 받을 수 있는 지원사업을 자동으로 찾고,
            내 조건에 맞는 공고 3~5개와 제출 전 준비도까지 한 번에 정리합니다.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href={LITTLY_URL_BUNDLE} className="btn-primary w-full sm:w-auto">
              맞춤 진단 리포트 받기
            </a>
            <Link
              href="/signup"
              className="w-full rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              이미 결제하셨나요? 가입하기
            </Link>
          </div>

          <dl className="mx-auto mt-14 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-extrabold text-teal">{s.value}</dt>
                <dd className="mt-1 text-xs text-slate">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* LIGHT CONTENT */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-xl font-bold text-navy-900">
          지원사업은 &lsquo;찾기&rsquo;가 아니라 &lsquo;제출하기&rsquo;에서 멈춥니다
        </h2>
        <ul className="mt-5 space-y-3">
          {FRICTION_POINTS.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-neutral-600">
              <span className="text-teal-dark" aria-hidden>●</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="callout-teal mt-8">
          이 서비스는 공고를 무작정 많이 보여주지 않습니다. 내 조건에 맞는 공고를 골라
          &lsquo;신청 준비를 시작하게&rsquo; 만드는 것이 목표입니다.
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="text-xl font-bold text-navy-900">이용 방법</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-navy-900/10 p-6">
            <p className="eyebrow text-teal-dark">{PRICING.bundle.name}</p>
            <p className="mt-2 text-sm text-neutral-500">1회 결제 · 즉시 진단</p>
            <ul className="mt-4 space-y-1.5 text-sm text-neutral-600">
              {PRICING.bundle.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-teal-dark">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a href={LITTLY_URL_BUNDLE} className="btn-primary mt-6 w-full text-center">
              결제하고 시작하기
            </a>
          </div>
          <div className="rounded-xl border border-navy-900/10 p-6">
            <p className="eyebrow text-teal-dark">{PRICING.starter.name}</p>
            <p className="mt-2 text-sm text-neutral-500">
              월 {PRICING.starter.price.toLocaleString()}원
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-neutral-600">
              {PRICING.starter.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-teal-dark">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a href={LITTLY_URL_STARTER} className="btn-outline mt-6 w-full text-center">
              구독 시작하기
            </a>
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-xl font-bold text-white">지원금 레이더를 구독해야 하는 이유</h2>
          <ol className="mt-6 space-y-3">
            {REASONS.map((reason, i) => (
              <li key={reason} className="flex gap-3 text-sm text-lavender">
                <span className="font-extrabold text-teal">{i + 1}</span>
                <span>{reason}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <p className="mx-auto max-w-3xl px-6 py-8 text-center text-xs text-neutral-400">
        본 서비스는 지원사업 신청 준비를 돕는 참고 자료이며, 선정을 보장하지 않습니다.
      </p>
    </main>
  )
}
