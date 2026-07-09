import { AppShell } from '@/components/AppShell'

const FAQS = [
  {
    q: '환불 정책이 어떻게 되나요?',
    a: '디지털 콘텐츠 특성상 진단 결과가 발급된 이후에는 환불이 제한됩니다. 결제 전 안내 화면에서 이 내용에 동의해야 결제를 진행할 수 있습니다. 진단 결과가 발급되기 전이라면 CS 채널로 문의해 주세요.',
  },
  {
    q: '재진단은 몇 번까지, 어떤 조건으로 가능한가요?',
    a: '상품별로 재진단 조건이 다릅니다. 재진단은 결제 시 지정한 동일 공고에 한정되며, 해당 공고의 마감일까지만 가능합니다. 정확한 잔여 횟수는 결제한 상품 상세 안내를 참고해 주세요.',
  },
  {
    q: '사업계획서가 HWP 파일인데 업로드가 되나요?',
    a: 'HWP 파일 첨부는 아직 지원하지 않습니다. 대신 HWP 문서의 내용을 복사해 텍스트로 붙여넣어 주시면 동일하게 진단이 진행됩니다.',
  },
  {
    q: '진단은 얼마나 걸리나요?',
    a: '보통 결제·정보 입력 직후 1분 이내에 결과가 나옵니다. 공고 원문 대조와 4축 채점, 위험 문장 점검을 순서대로 진행하며, 드물게 지연되는 경우 자동으로 재시도됩니다.',
  },
]

export default function FaqPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow text-teal-dark">FAQ</p>
        <h1 className="mt-2 text-2xl font-extrabold text-navy-900">자주 묻는 질문</h1>
        <ul className="mt-8 space-y-6">
          {FAQS.map((item) => (
            <li key={item.q} className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-base font-bold text-navy-900">{item.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  )
}
