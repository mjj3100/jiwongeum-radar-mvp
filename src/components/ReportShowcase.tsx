const INPUT_FIELDS = [
  '사업자 상태', '연령대', '성별', '사업장 소재지', '업종', '창업일',
  '연매출 구간', '직원 수', '사업 아이템', '필요한 지원', '준비 상태',
]

const SAMPLE_SCORES = [
  { label: '관련성', value: 22, reason: 'AI 활용과 소상공인 문제 해결이 직접 연결됨' },
  { label: '구체성', value: 16, reason: '기능·일정은 있으나 고객검증 수치가 부족함' },
  { label: '차별성', value: 17, reason: '마케팅 대행업과의 차별점을 더 보강해야 함' },
  { label: '실현가능성', value: 18, reason: '수동 테스트 경험은 있으나 개발 견적이 필요함' },
]

/** 랜딩 "말이 아니라, 리포트로" 섹션용 확대 목업 — 실제 /result 화면 정보 구조를 그대로 반영 */
export function ReportShowcase() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-[0_12px_40px_rgba(10,19,48,0.06)] sm:p-8">
        <p className="eyebrow text-teal-dark">INPUT</p>
        <h3 className="mt-2 text-lg font-bold text-navy-900">11개 항목만 입력하면 끝</h3>
        <p className="mt-2 text-sm text-neutral-500">
          사업계획서를 새로 쓸 필요 없이, 최소한의 정보로 시작합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {INPUT_FIELDS.map((f) => (
            <span
              key={f}
              className="rounded-full border border-teal-dark/20 bg-teal-tint px-3 py-1.5 text-sm font-medium text-teal-dark"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-teal bg-white p-6 shadow-[0_12px_40px_rgba(0,212,170,0.12)] sm:p-8">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-teal-dark">OUTPUT</p>
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">추천</span>
        </div>
        <h3 className="mt-2 text-lg font-bold text-navy-900">1순위 공고 미니 4축 예비진단</h3>
        <div className="mt-5 space-y-4">
          {SAMPLE_SCORES.map((s) => (
            <div key={s.label}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-neutral-400">{s.label}</span>
                <span className="font-bold text-navy-900">{s.value}/25</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
                <div className="h-1.5 rounded-full bg-teal-dark" style={{ width: `${(s.value / 25) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">{s.reason}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="text-sm text-neutral-400">예비진단 합계</span>
          <span className="text-xl font-extrabold text-teal-dark">73/100</span>
        </div>
      </div>
    </div>
  )
}
