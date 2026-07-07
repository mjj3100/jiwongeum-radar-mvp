import Link from 'next/link'
import { RadarLogo, RadarGlow } from '@/components/RadarLogo'
import { LITTLY_URL_BUNDLE, LITTLY_URL_STARTER, PRICING, SHOW_STARTER_ON_LANDING } from '@/lib/constants'

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

const STEPS = [
  { n: '01', title: '리틀리에서 결제', desc: '전자책 + 맞춤 진단 리포트 상품을 결제합니다.' },
  { n: '02', title: '주문번호 확인', desc: '결제완료 화면과 카카오 알림톡에 16자리 주문번호가 표시됩니다.' },
  { n: '03', title: '가입 + 주문번호 입력', desc: '전달받은 링크에서 이메일·비밀번호와 주문번호를 입력하면 즉시 승인됩니다.' },
  { n: '04', title: '맞춤 진단 받기', desc: '사업 정보만 입력하면 맞춤 공고 3~5개와 미니 4축 진단이 바로 나옵니다.' },
]

export default function LandingPage() {
  return (
    <main>
      {/* HERO — 다크 네이비 + 레이더 글로우 */}
      <section className="relative overflow-hidden bg-navy-950">
        <RadarGlow className="absolute -right-40 -top-32 h-[620px] w-[620px] opacity-90 sm:-right-20" />
        <nav className="relative mx-auto flex max-w-4xl items-center justify-between px-6 pt-8">
          <div className="flex items-center gap-2">
            <RadarLogo size={28} />
            <span className="text-base font-bold text-white">지원금 레이더</span>
          </div>
          <Link
            href="/login"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            로그인
          </Link>
        </nav>
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-12 text-center sm:pb-32">
          <p className="eyebrow text-base text-teal">AI 지원사업 신청 준비 OS</p>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl md:text-7xl">
            지원사업, <span className="text-teal">찾는 것</span>에서
            <br />
            끝나지 않게.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-lavender sm:text-xl">
            예비창업자·초기창업자·소상공인이 받을 수 있는 지원사업을 자동으로 찾고,
            내 조건에 맞는 공고 3~5개와 제출 전 준비도까지 한 번에 정리합니다.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href={LITTLY_URL_BUNDLE} className="btn-primary w-full text-base sm:w-auto">
              맞춤 진단 리포트 받기
            </a>
            <Link
              href="/signup"
              className="w-full rounded-md border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              이미 결제하셨나요? 가입하기
            </Link>
          </div>

          <dl className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-3xl font-extrabold text-teal sm:text-4xl">{s.value}</dt>
                <dd className="mt-1.5 text-sm text-slate">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 구매 후 진행 순서 */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="eyebrow text-teal-dark">HOW IT WORKS</p>
        <h2 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl">
          구매 후 이렇게 진행됩니다
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm">
              <span className="text-3xl font-extrabold text-teal-tint" style={{ WebkitTextStroke: '1.5px #00D4AA' }}>
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-bold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-xl text-teal/40 lg:block">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 문제 인식 */}
      <section className="bg-neutral-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">
            지원사업은 &lsquo;찾기&rsquo;가 아니라 &lsquo;제출하기&rsquo;에서 멈춥니다
          </h2>
          <ul className="mt-8 space-y-4">
            {FRICTION_POINTS.map((point) => (
              <li key={point} className="flex gap-3 text-base text-neutral-700 sm:text-lg">
                <span className="mt-1.5 text-teal-dark" aria-hidden>●</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="callout-teal mt-10 text-base">
            이 서비스는 공고를 무작정 많이 보여주지 않습니다. 내 조건에 맞는 공고를 골라
            &lsquo;신청 준비를 시작하게&rsquo; 만드는 것이 목표입니다.
          </div>
        </div>
      </section>

      {/* 가격 */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <p className="eyebrow text-teal-dark">PRICING</p>
        <h2 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl">이용 방법</h2>
        <div className={`mt-10 grid gap-6 ${SHOW_STARTER_ON_LANDING ? 'sm:grid-cols-2' : 'mx-auto max-w-md'}`}>
          <div className="rounded-2xl border-2 border-teal bg-white p-8 shadow-[0_8px_30px_rgba(0,212,170,0.12)]">
            <p className="eyebrow text-teal-dark">{PRICING.bundle.name}</p>
            <p className="mt-3 text-sm text-neutral-500">1회 결제 · 즉시 진단</p>
            <ul className="mt-6 space-y-2.5 text-base text-neutral-700">
              {PRICING.bundle.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span className="font-bold text-teal-dark">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a href={LITTLY_URL_BUNDLE} className="btn-primary mt-8 w-full text-center text-base">
              결제하고 시작하기
            </a>
          </div>
          {SHOW_STARTER_ON_LANDING && (
            <div className="rounded-2xl border border-navy-900/10 bg-white p-8">
              <p className="eyebrow text-teal-dark">{PRICING.starter.name}</p>
              <p className="mt-3 text-sm text-neutral-500">
                월 {PRICING.starter.price.toLocaleString()}원
              </p>
              <ul className="mt-6 space-y-2.5 text-base text-neutral-700">
                {PRICING.starter.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="font-bold text-teal-dark">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={LITTLY_URL_STARTER} className="btn-outline mt-8 w-full text-center text-base">
                구독 시작하기
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 클로징 */}
      <section className="bg-navy-950 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            지원금 레이더를 써야 하는 이유
          </h2>
          <ol className="mt-10 space-y-5">
            {REASONS.map((reason, i) => (
              <li key={reason} className="flex gap-4 text-lg text-lavender">
                <span className="text-xl font-extrabold text-teal">{i + 1}</span>
                <span>{reason}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <p className="mx-auto max-w-4xl px-6 py-10 text-center text-sm text-neutral-400">
        본 서비스는 지원사업 신청 준비를 돕는 참고 자료이며, 선정을 보장하지 않습니다.
      </p>
    </main>
  )
}
