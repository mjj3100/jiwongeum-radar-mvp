'use client'

import Link from 'next/link'
import { RadarLogo, RadarGlow } from '@/components/RadarLogo'
import type { AxisReasons, BusinessProfileInput, EligibilityCheck, EligibilityStatus, RiskSentence, Verdict } from '@/lib/types'

interface MatchRow {
  id: string
  grant_listing_id: string
  verdict: Verdict
  fit_reason: string
  caution_note: string | null
  prep_priority: number
  eligibility_checks: EligibilityCheck[] | null
  quote_excerpt: string | null
  required_documents: string[] | null
  grant_listings: {
    title: string
    agency: string | null
    original_url: string | null
    support_content: string | null
    support_scale: string | null
    apply_end: string | null
  } | null
}

interface DiagnosisRow {
  id: string
  grant_listing_id: string | null
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

const ELIG_MARK: Record<EligibilityStatus, { symbol: string; className: string }> = {
  충족: { symbol: '✓', className: 'text-teal-dark' },
  주의: { symbol: '△', className: 'text-gold-ink' },
  미충족: { symbol: '✗', className: 'text-report-danger' },
}

// SCAN은 첫 진단 포함 총 3회까지 재분석 가능 (src/lib/analyze-service.ts의 MAX_ANALYSIS_COUNT와 동일)
const MAX_ANALYSIS_COUNT = 3

export function ResultsView({
  matches,
  diagnosis,
  analysisCount,
  businessProfile,
}: {
  matches: MatchRow[]
  diagnosis: DiagnosisRow | null
  analysisCount: number
  businessProfile: BusinessProfileInput & { updated_at: string }
}) {
  const diagnosedMatch = diagnosis
    ? matches.find((m) => m.grant_listing_id === diagnosis.grant_listing_id)
    : undefined

  const founderLabel = `${businessProfile.founder_status}${
    businessProfile.age_group ? ` (${businessProfile.age_group})` : ''
  }`
  const issueDate = diagnosis?.created_at ?? businessProfile.updated_at
  const issueDateLabel = formatDate(issueDate)
  const reportNo = diagnosis ? buildReportNo(diagnosis) : null
  const headline = buildHeadline(matches, diagnosis)
  const remaining = Math.max(0, MAX_ANALYSIS_COUNT - analysisCount)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-400">
          {remaining > 0
            ? `재진단 ${remaining}회 남음 (총 ${MAX_ANALYSIS_COUNT}회 중 ${analysisCount}회 사용)`
            : '재진단 소진 — 더 정밀한 진단은 출시 예정인 LOCK-ON(19,900원)에서 만나요'}
        </p>
        <Link
          href="/result?edit=1"
          className="whitespace-nowrap rounded-md border border-navy-900/15 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
        >
          정보 수정하기
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy-900/10 shadow-[0_20px_60px_rgba(10,19,48,0.12)]">
        {/* ── 리포트 헤더 (navy) ───────────── */}
        <div className="relative overflow-hidden bg-navy-900 px-6 py-8 text-white sm:px-10 sm:py-10">
          <RadarGlow className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-40" />
          <div className="relative flex items-center gap-2">
            <RadarLogo size={28} />
            <span className="text-sm font-bold tracking-wide">지원금 레이더</span>
          </div>
          <h1 className="relative mt-5 text-xl font-extrabold sm:text-2xl">
            맞춤 지원사업 진단 <span className="text-teal">리포트</span>
          </h1>
          <dl className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/70">
            <div>
              진단 대상<b className="ml-1.5 font-medium text-white">{founderLabel}</b>
            </div>
            <div>
              사업 아이디어<b className="ml-1.5 font-medium text-white">{truncate(businessProfile.item_description, 40)}</b>
            </div>
            <div>
              지역<b className="ml-1.5 font-medium text-white">{businessProfile.region}</b>
            </div>
            <div>
              발급일<b className="ml-1.5 font-medium text-white">{issueDateLabel}</b>
            </div>
            {reportNo && (
              <div>
                리포트 번호<b className="ml-1.5 font-medium text-white">{reportNo}</b>
              </div>
            )}
          </dl>
        </div>

        {/* ── 본문 ───────────── */}
        <div className="space-y-8 bg-white px-6 py-8 sm:px-10 sm:py-10">
          {/* Section 1 — 종합 판정 */}
          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-deep">Summary</p>
            <h2 className="mt-1 text-lg font-bold text-navy-900">종합 판정</h2>
            <div className="mt-4 rounded-xl border border-teal-dark/20 bg-gradient-to-br from-teal-tint to-white p-6">
              <p className="text-base font-bold text-teal-deep">{headline}</p>
              {diagnosis?.summary && <p className="mt-2 text-sm text-neutral-600">{diagnosis.summary}</p>}
              {matches.length === 0 && (
                <p className="mt-2 text-sm text-neutral-600">
                  오류가 아니라, 현재 등록된 공고 중에는 입력하신 조건과 강하게 맞는 게 없었다는 뜻이에요.
                  공고 데이터는 매일 새벽 자동으로 업데이트되니, 며칠 뒤 다시 확인하면 새 공고가 잡힐 수 있어요.
                </p>
              )}
              <div className="mt-4 rounded-md border-l-[3px] border-gold bg-[#FBF6EA] px-4 py-3 text-sm text-gold-ink">
                이 결과는 제출 준비도를 점검하는 참고 자료이며, 합격이나 선정을 보장하지 않습니다.
              </div>
              {matches.length === 0 && (
                <Link href="/result?edit=1" className="btn-outline mt-4 inline-block text-sm">
                  정보 수정하고 다시 검색하기
                </Link>
              )}
            </div>
          </section>

          {/* Section 2 — 공고 후보 */}
          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-deep">Detected Grants</p>
            <h2 className="mt-1 text-lg font-bold text-navy-900">맞춤 공고 후보 {matches.length}건</h2>
            <ul className="mt-4 space-y-4">
              {matches.map((m) => {
                const isTop = m.prep_priority === 1
                const hasDiagnosis = diagnosedMatch?.id === m.id
                return (
                  <li
                    key={m.id}
                    className={`rounded-xl border bg-white p-5 ${
                      isTop
                        ? 'border-teal-dark/30 border-l-4 border-l-teal-dark shadow-[0_10px_32px_rgba(0,212,170,0.14)]'
                        : 'border-neutral-200 border-l-4 border-l-neutral-200 shadow-[0_8px_24px_rgba(10,19,48,0.05)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-navy-900">{m.grant_listings?.title ?? '공고'}</h3>
                        {m.grant_listings?.agency && (
                          <p className="mt-0.5 text-xs text-neutral-400">{m.grant_listings.agency}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {hasDiagnosis && (
                          <span className="rounded-full bg-navy-900 px-2.5 py-1 text-xs font-bold text-teal">
                            4축 진단 포함
                          </span>
                        )}
                        <DdayBadge applyEnd={m.grant_listings?.apply_end ?? null} />
                        <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${VERDICT_STYLE[m.verdict]}`}>
                          {m.verdict}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-base text-neutral-600">{m.fit_reason}</p>
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

                    {m.eligibility_checks && m.eligibility_checks.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-dashed border-neutral-200 pt-4">
                        {m.eligibility_checks.map((e, i) => {
                          const mark = ELIG_MARK[e.status]
                          return (
                            <div key={i} className="flex gap-2 text-sm">
                              <span className={`font-bold ${mark.className}`}>{mark.symbol}</span>
                              <span className="text-neutral-600">
                                <b className="font-semibold text-navy-900">{e.label}</b> — {e.detail}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {m.quote_excerpt && (
                      <div className="mt-3 rounded-md border-l-2 border-teal-dark bg-teal-tint/40 px-4 py-2.5">
                        <p className="font-mono text-[11px] uppercase tracking-wide text-teal-deep">공고 원문 근거</p>
                        <p className="mt-1 text-sm text-neutral-600">「{m.quote_excerpt}」</p>
                      </div>
                    )}

                    {m.required_documents && m.required_documents.length > 0 && (
                      <div className="mt-4 border-t border-dashed border-neutral-200 pt-4">
                        <p className="text-xs font-semibold tracking-wide text-neutral-400">필요 서류 체크리스트</p>
                        <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                          {m.required_documents.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                              <span className="text-teal-dark">☐</span>
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-neutral-400">
                          ※ 일반적으로 요구되는 서류 예시이며, 정확한 서류는 공고 원문에서 확인하세요.
                        </p>
                      </div>
                    )}

                    {m.grant_listings?.original_url && (
                      <div className="mt-3 flex justify-end">
                        <a
                          href={m.grant_listings.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-teal-dark hover:underline"
                        >
                          원문 공고 보기 ↗
                        </a>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Section 3 — 4축 예비진단 */}
          {diagnosis && (
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-deep">
                    4-Axis Preliminary Diagnosis
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-navy-900">
                    {diagnosedMatch ? `${diagnosedMatch.grant_listings?.title ?? ''} ` : ''}미니 4축 예비진단
                  </h2>
                </div>
                <p className="text-xs text-neutral-400">{formatDateTime(diagnosis.created_at)} 기준</p>
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                입력하신 요약 정보를 기준으로 낸 약식 진단이에요. 실제 사업계획서를 바탕으로 한 상세 진단은
                아니니, 점수보다 아래 요약과 위험 문장 코멘트를 참고용으로 봐주세요.
              </p>
              <div className="mt-4 rounded-xl border-2 border-teal-dark/30 bg-white p-6 shadow-[0_8px_30px_rgba(0,212,170,0.1)]">
                <p className="text-4xl font-extrabold text-navy-900">
                  {diagnosis.total_score} <span className="text-xl text-neutral-400">/ 100</span>
                </p>
                <dl className="mt-5 grid grid-cols-1 gap-5 text-base sm:grid-cols-2">
                  <Score label="관련성" value={diagnosis.relevance_score} reason={diagnosis.axis_reasons?.relevance} />
                  <Score label="구체성" value={diagnosis.concreteness_score} reason={diagnosis.axis_reasons?.concreteness} />
                  <Score label="차별성" value={diagnosis.differentiation_score} reason={diagnosis.axis_reasons?.differentiation} />
                  <Score label="실현가능성" value={diagnosis.feasibility_score} reason={diagnosis.axis_reasons?.feasibility} />
                </dl>

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

                <div className="mt-5 rounded-md border-l-[3px] border-gold bg-[#FBF6EA] px-4 py-3 text-xs text-gold-ink">
                  이 4축은 공고 원문과 공개된 평가 기준을 참고해 설계됐어요. 모든 공고에 공식 배점표가
                  공개된 건 아니라, 점수는 참고 지표로 봐주세요.
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── 리포트 푸터 (navy) ───────────── */}
        <div className="bg-navy-900 px-6 py-5 text-xs leading-relaxed text-white/60 sm:px-10">
          <b className="text-white/90">지원금 레이더 · 맞춤 지원사업 진단 리포트</b>
          <br />
          서류 체크리스트는 일반적으로 요구되는 서류의 예시이며, 정확한 서류는 공고 원문에서 확인하세요.
          <br />
          원문 인용은 해당 공고 원문에서 그대로 발췌한 문장입니다.
        </div>
      </div>
    </div>
  )
}

function truncate(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}…` : clean
}

function buildHeadline(matches: MatchRow[], diagnosis: DiagnosisRow | null): string {
  if (matches.length === 0) {
    return '지금은 뚜렷하게 맞는 공고를 찾지 못했어요'
  }
  // 후보는 있지만 4축 총점이 낮으면(예: 타지역 이전이 필요한 공고가 최선인 경우) "접수
  // 가능한 공고가 탐지됐다"는 낙관적인 문구 대신 톤을 낮춘다. 공고는 매일 갱신되니
  // 며칠 뒤 다시 확인하라는 안내로 재진단 3회를 자연스럽게 쓰도록 유도한다.
  if (diagnosis && diagnosis.total_score < 50) {
    return '지금 후보들은 전반적으로 적합도가 낮아요. 아래는 참고만 하시고, 공고는 매일 업데이트되니 며칠 뒤 다시 확인해보세요.'
  }
  const goodCount = matches.filter((m) => m.verdict === '추천' || m.verdict === '조건부').length
  if (goodCount > 0) {
    return `지금 조건으로 접수 가능한 공고가 ${goodCount}건 탐지되었습니다.`
  }
  return `조건을 더 확인해봐야 하는 공고 ${matches.length}건을 찾았어요.`
}

function buildReportNo(diagnosis: DiagnosisRow): string {
  const d = new Date(diagnosis.created_at)
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `JR-${yy}${mm}-${diagnosis.id.slice(0, 6).toUpperCase()}`
}

function Score({ label, value, reason }: { label: string; value: number; reason?: string }) {
  const isLow = value < 13
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <dt className="text-sm text-neutral-400">{label}</dt>
        <dd className="text-lg font-bold text-navy-900">{value}/25</dd>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${
            isLow ? 'from-gold-dim to-gold' : 'from-teal-deep to-teal-dark'
          }`}
          style={{ width: `${(value / 25) * 100}%` }}
        />
      </div>
      {reason && (
        <p className="mt-2 border-l-2 border-neutral-200 pl-3 text-sm text-neutral-500">{reason}</p>
      )}
    </div>
  )
}

// Intl.toLocaleString('ko-KR')는 서버(Node)와 브라우저의 ICU 데이터 차이로 오전/오후 표기가
// 서로 다르게 나와("오후" vs "PM") 하이드레이션 불일치를 일으킨 적이 있다(이 컴포넌트가
// 'use client'라 서버 렌더와 클라이언트 hydration에서 같은 포맷 코드가 각각 실행됨).
// 로케일 API에 의존하지 않고 직접 조립해 두 환경에서 항상 동일한 문자열이 나오게 한다.
function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${pad2(d.getMonth() + 1)}. ${pad2(d.getDate())}.`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const hour24 = d.getHours()
  const period = hour24 < 12 ? '오전' : '오후'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${formatDate(iso)} ${period} ${pad2(hour12)}:${pad2(d.getMinutes())}`
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
