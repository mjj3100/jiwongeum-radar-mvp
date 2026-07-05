import Link from 'next/link'
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

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <section className="text-center">
        <p className="text-sm font-medium text-neutral-500">지원금 레이더 · AI 지원사업 신청 준비 OS</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          지원사업, 찾는 것에서 끝나지 않게.
        </h1>
        <p className="mt-4 text-neutral-600">
          예비창업자·초기창업자·소상공인이 받을 수 있는 지원사업을 자동으로 찾고,
          내 조건에 맞는 공고 3~5개와 제출 전 준비도까지 한 번에 정리합니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={LITTLY_URL_BUNDLE}
            className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            맞춤 진단 리포트 받기
          </a>
          <Link
            href="/signup"
            className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold hover:bg-neutral-50"
          >
            이미 결제하셨나요? 가입하기
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-lg font-semibold">지원사업은 &lsquo;찾기&rsquo;가 아니라 &lsquo;제출하기&rsquo;에서 멈춥니다</h2>
        <ul className="mt-4 space-y-2">
          {FRICTION_POINTS.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-neutral-600">
              <span aria-hidden>·</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold">{PRICING.bundle.name}</h3>
          <p className="mt-1 text-sm text-neutral-500">1회 결제 · 즉시 진단</p>
          <ul className="mt-4 space-y-1 text-sm text-neutral-600">
            {PRICING.bundle.features.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <a
            href={LITTLY_URL_BUNDLE}
            className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            결제하고 시작하기
          </a>
        </div>
        <div className="rounded-lg border border-neutral-200 p-6">
          <h3 className="font-semibold">{PRICING.starter.name}</h3>
          <p className="mt-1 text-sm text-neutral-500">월 {PRICING.starter.price.toLocaleString()}원</p>
          <ul className="mt-4 space-y-1 text-sm text-neutral-600">
            {PRICING.starter.features.map((f) => (
              <li key={f}>· {f}</li>
            ))}
          </ul>
          <a
            href={LITTLY_URL_STARTER}
            className="mt-4 inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
          >
            구독 시작하기
          </a>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold">지원금 레이더를 구독해야 하는 이유</h2>
        <ol className="mt-4 space-y-2">
          {REASONS.map((reason, i) => (
            <li key={reason} className="flex gap-3 text-sm text-neutral-600">
              <span className="font-semibold text-neutral-400">{i + 1}</span>
              <span>{reason}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-16 text-center text-xs text-neutral-400">
        본 서비스는 지원사업 신청 준비를 돕는 참고 자료이며, 선정을 보장하지 않습니다.
      </p>
    </main>
  )
}
