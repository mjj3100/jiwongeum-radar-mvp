'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { rerunAnalysis } from './actions'
import type { AxisReasons, RiskSentence, Verdict } from '@/lib/types'

interface MatchRow {
  id: string
  grant_listing_id: string
  verdict: Verdict
  fit_reason: string
  caution_note: string | null
  prep_priority: number
  grant_listings: {
    title: string
    original_url: string | null
    support_content: string | null
    support_scale: string | null
    apply_end: string | null
  } | null
}

interface DiagnosisRow {
  relevance_score: number
  concreteness_score: number
  differentiation_score: number
  feasibility_score: number
  total_score: number
  axis_reasons: AxisReasons | null
  risk_sentences: RiskSentence[]
  summary: string
  created_at: string
}

const VERDICT_STYLE: Record<Verdict, string> = {
  추천: 'bg-green-100 text-green-800',
  조건부: 'bg-yellow-100 text-yellow-800',
  '확인 필요': 'bg-blue-100 text-blue-800',
  비추천: 'bg-neutral-100 text-neutral-600',
}

const VERDICT_ACCENT: Record<Verdict, string> = {
  추천: 'border-l-green-400',
  조건부: 'border-l-yellow-400',
  '확인 필요': 'border-l-blue-400',
  비추천: 'border-l-neutral-300',
}

export function ResultsView({
  matches,
  diagnosis,
  canRerun,
}: {
  matches: MatchRow[]
  diagnosis: DiagnosisRow | null
  canRerun: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleRerun = () => {
    setError('')
    startTransition(async () => {
      const result = await rerunAnalysis()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-navy-900">맞춤 지원사업 진단 결과</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/result?edit=1"
            className="whitespace-nowrap rounded-md border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
          >
            정보 수정하기
          </Link>
          {canRerun && (
            <button
              onClick={handleRerun}
              disabled={pending}
              className="whitespace-nowrap rounded-md border border-teal-dark/40 px-4 py-2 text-sm font-semibold text-teal-dark hover:bg-teal-tint disabled:opacity-50"
            >
              {pending ? '다시 분석 중...' : '다시 진단받기'}
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-base text-red-600">{error}</p>}

      <section>
        <h2 className="text-base font-bold text-neutral-500">맞춤 공고 후보</h2>
        {matches.length === 0 && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-lg font-bold text-navy-900">지금은 뚜렷하게 맞는 공고를 찾지 못했어요</p>
            <p className="mt-2 text-base text-neutral-600">
              오류가 아니라, 현재 등록된 공고 중에는 입력하신 조건과 강하게 맞는 게 없었다는 뜻이에요.
              공고 데이터는 매일 새벽 자동으로 업데이트되니, 며칠 뒤 다시 확인하면 새 공고가 잡힐 수 있어요.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-500">
              <li>업종·사업 아이템 설명을 조금 더 구체적으로 적어보세요</li>
              <li>지역/사업자 상태를 다시 한번 확인해보세요</li>
            </ul>
            <Link
              href="/result?edit=1"
              className="btn-outline mt-4 inline-block text-sm"
            >
              정보 수정하고 다시 검색하기
            </Link>
          </div>
        )}
        <ul className="mt-4 space-y-4">
          {matches.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl border border-neutral-200 border-l-4 bg-white p-5 shadow-[0_8px_24px_rgba(10,19,48,0.05)] ${VERDICT_ACCENT[m.verdict]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-navy-900">{m.grant_listings?.title ?? '공고'}</h3>
                <div className="flex shrink-0 items-center gap-2">
                  <DdayBadge applyEnd={m.grant_listings?.apply_end ?? null} />
                  <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${VERDICT_STYLE[m.verdict]}`}>
                    {m.verdict}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-base text-neutral-600">{m.fit_reason}</p>
              {m.caution_note && (
                <p className="mt-2 text-sm text-amber-700">주의: {m.caution_note}</p>
              )}
              {m.grant_listings?.support_scale ? (
                <p className="mt-2 text-sm text-neutral-500">지원 규모: {m.grant_listings.support_scale}</p>
              ) : (
                m.grant_listings?.support_content && (
                  <p className="mt-2 text-sm text-neutral-500">
                    지원 내용: {truncate(m.grant_listings.support_content, 150)}
                  </p>
                )
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-neutral-400">준비 우선순위 {m.prep_priority}</p>
                {m.grant_listings?.original_url && (
                  <a
                    href={m.grant_listings.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-teal-dark hover:underline"
                  >
                    원문 공고 보기 ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {diagnosis && (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base font-bold text-neutral-500">1순위 공고 미니 4축 예비진단</h2>
            <p className="text-xs text-neutral-400">{formatDateTime(diagnosis.created_at)} 기준</p>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            입력하신 요약 정보를 기준으로 낸 약식 진단이에요. 실제 사업계획서를 바탕으로 한 상세 진단은
            아니니, 점수보다 아래 요약과 위험 문장 코멘트를 참고용으로 봐주세요.
          </p>
          <div className="mt-4 rounded-xl border-2 border-teal bg-white p-6 shadow-[0_8px_30px_rgba(0,212,170,0.1)]">
            <p className="text-4xl font-extrabold text-navy-900">{diagnosis.total_score} <span className="text-xl text-neutral-400">/ 100</span></p>
            <dl className="mt-5 grid grid-cols-1 gap-5 text-base sm:grid-cols-2">
              <Score label="관련성" value={diagnosis.relevance_score} reason={diagnosis.axis_reasons?.relevance} />
              <Score label="구체성" value={diagnosis.concreteness_score} reason={diagnosis.axis_reasons?.concreteness} />
              <Score label="차별성" value={diagnosis.differentiation_score} reason={diagnosis.axis_reasons?.differentiation} />
              <Score label="실현가능성" value={diagnosis.feasibility_score} reason={diagnosis.axis_reasons?.feasibility} />
            </dl>
            <p className="mt-5 text-base text-neutral-600">{diagnosis.summary}</p>

            {diagnosis.risk_sentences?.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-neutral-500">위험 문장 점검</h3>
                <ul className="mt-3 space-y-3">
                  {diagnosis.risk_sentences.map((r, i) => (
                    <li key={i} className="text-sm">
                      <p className="text-neutral-500">&ldquo;{r.quote}&rdquo; — {r.reason}</p>
                      <p className="mt-1 text-neutral-700">개선: {r.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <p className="text-sm text-neutral-400">
        이 결과는 제출 준비도를 점검하는 참고 자료이며, 합격이나 선정을 보장하지 않습니다.
      </p>
    </div>
  )
}

function truncate(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}…` : clean
}

function Score({ label, value, reason }: { label: string; value: number; reason?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-neutral-400">{label}</dt>
        <dd className="text-lg font-bold text-navy-900">{value}/25</dd>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
        <div className="h-1.5 rounded-full bg-teal-dark" style={{ width: `${(value / 25) * 100}%` }} />
      </div>
      {reason && <p className="mt-2 text-sm text-neutral-500">{reason}</p>}
    </div>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DdayBadge({ applyEnd }: { applyEnd: string | null }) {
  if (!applyEnd) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(applyEnd)
  const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return null

  const label = diffDays === 0 ? 'D-day' : `D-${diffDays}`
  const urgent = diffDays <= 7

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-sm font-semibold ${
        urgent ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-500'
      }`}
    >
      {label}
    </span>
  )
}
