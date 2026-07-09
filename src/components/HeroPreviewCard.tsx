const SAMPLE_SCORES = [
  { label: '관련성', value: 22 },
  { label: '구체성', value: 16 },
  { label: '차별성', value: 17 },
  { label: '실현가능성', value: 18 },
]

/** 히어로 섹션용 결과 화면 미리보기 — 실제 /result 카드 UI를 그대로 축소 재현 */
export function HeroPreviewCard() {
  const total = SAMPLE_SCORES.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-navy-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate">맞춤 공고 1순위</p>
        <span className="rounded-full bg-teal/15 px-2.5 py-1 text-xs font-bold text-teal">추천</span>
      </div>
      <p className="mt-2 text-sm font-bold leading-snug text-white">
        2026년 혁신 소상공인 AI활용지원사업
      </p>

      <div className="mt-5 space-y-3">
        {SAMPLE_SCORES.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-lavender">{s.label}</span>
              <span className="font-semibold text-white">{s.value}/25</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-1.5 rounded-full bg-teal"
                style={{ width: `${(s.value / 25) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-slate">예비진단 합계</span>
        <span className="text-lg font-extrabold text-teal">{total}/100</span>
      </div>
    </div>
  )
}
