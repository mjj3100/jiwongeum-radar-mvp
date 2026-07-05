'use client'

import { useState, useTransition } from 'react'
import { rerunAnalysis } from './actions'
import type { RiskSentence, Verdict } from '@/lib/types'

interface MatchRow {
  id: string
  grant_listing_id: string
  verdict: Verdict
  fit_reason: string
  caution_note: string | null
  prep_priority: number
  grant_listings: { title: string } | null
}

interface DiagnosisRow {
  relevance_score: number
  concreteness_score: number
  differentiation_score: number
  feasibility_score: number
  total_score: number
  risk_sentences: RiskSentence[]
  summary: string
}

const VERDICT_STYLE: Record<Verdict, string> = {
  추천: 'bg-green-100 text-green-800',
  조건부: 'bg-yellow-100 text-yellow-800',
  '확인 필요': 'bg-blue-100 text-blue-800',
  비추천: 'bg-neutral-100 text-neutral-600',
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy-900">맞춤 지원사업 진단 결과</h1>
        {canRerun && (
          <button
            onClick={handleRerun}
            disabled={pending}
            className="rounded-md border border-teal-dark/40 px-3 py-1.5 text-xs font-semibold text-teal-dark hover:bg-teal-tint disabled:opacity-50"
          >
            {pending ? '다시 분석 중...' : '다시 진단받기'}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="text-sm font-semibold text-neutral-500">맞춤 공고 후보</h2>
        {matches.length === 0 && (
          <p className="mt-2 text-sm text-neutral-500">현재 조건에 맞는 공고를 찾지 못했습니다. 사업 정보를 다시 확인해보세요.</p>
        )}
        <ul className="mt-3 space-y-3">
          {matches.map((m) => (
            <li key={m.id} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{m.grant_listings?.title ?? '공고'}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${VERDICT_STYLE[m.verdict]}`}>
                  {m.verdict}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{m.fit_reason}</p>
              {m.caution_note && (
                <p className="mt-1 text-xs text-amber-700">주의: {m.caution_note}</p>
              )}
              <p className="mt-1 text-xs text-neutral-400">준비 우선순위 {m.prep_priority}</p>
            </li>
          ))}
        </ul>
      </section>

      {diagnosis && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500">1순위 공고 미니 4축 예비진단</h2>
          <div className="mt-3 rounded-lg border border-neutral-200 p-4">
            <p className="text-2xl font-bold">{diagnosis.total_score} / 100</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Score label="관련성" value={diagnosis.relevance_score} />
              <Score label="구체성" value={diagnosis.concreteness_score} />
              <Score label="차별성" value={diagnosis.differentiation_score} />
              <Score label="실현가능성" value={diagnosis.feasibility_score} />
            </dl>
            <p className="mt-4 text-sm text-neutral-600">{diagnosis.summary}</p>

            {diagnosis.risk_sentences?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-neutral-500">위험 문장 점검</h3>
                <ul className="mt-2 space-y-2">
                  {diagnosis.risk_sentences.map((r, i) => (
                    <li key={i} className="text-xs">
                      <p className="text-neutral-500">&ldquo;{r.quote}&rdquo; — {r.reason}</p>
                      <p className="mt-0.5 text-neutral-700">개선: {r.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <p className="text-xs text-neutral-400">
        이 결과는 제출 준비도를 점검하는 참고 자료이며, 합격이나 선정을 보장하지 않습니다.
      </p>
    </div>
  )
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-neutral-400">{label}</dt>
      <dd className="font-semibold">{value}/25</dd>
    </div>
  )
}
