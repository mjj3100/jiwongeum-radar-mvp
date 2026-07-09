import { AppShell } from '@/components/AppShell'

export default function TermsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-10 text-neutral-700">
        <div>
          <p className="eyebrow text-teal-dark">TERMS</p>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900">이용약관</h1>
          <p className="mt-2 text-sm text-neutral-400">시행일: [사업자 등록 완료 후 확정 예정]</p>
        </div>

        <Section title="제1조 (목적)">
          <p>
            이 약관은 지원금 레이더(이하 &lsquo;회사&rsquo;)가 제공하는 지원사업 매칭 및 제출 준비도
            진단 서비스(이하 &lsquo;서비스&rsquo;)의 이용 조건과 절차, 회사와 이용자의 권리·의무를
            규정합니다.
          </p>
        </Section>

        <Section title="제2조 (서비스의 내용)">
          <p>
            서비스는 이용자가 입력한 사업 정보를 바탕으로 한 맞춤 지원사업 후보 안내, 제출 전 준비도
            예비진단(4축 채점, 위험 문장 점검)으로 구성됩니다. 서비스는 참고 자료를 제공할 뿐,
            지원사업 선정이나 합격을 보장하지 않습니다.
          </p>
        </Section>

        <Section title="제3조 (이용계약의 체결)">
          <p>
            이용자는 결제 완료 후 발급되는 주문번호를 회원가입 시 입력함으로써 서비스 이용권을
            획득합니다. 주문번호는 1회만 사용할 수 있습니다.
          </p>
        </Section>

        <Section title="제4조 (결제 및 환불)">
          <p>
            서비스는 디지털 콘텐츠로, 진단 결과가 발급된 이후에는 「전자상거래 등에서의 소비자보호에
            관한 법률」에 따라 환불(청약철회)이 제한됩니다. 결제 전 이 내용을 명시적으로 고지하며,
            이용자는 결제 전 동의 절차를 통해 이를 확인합니다. 진단 결과 발급 전 환불 요청은 CS
            채널로 접수해 처리합니다.
          </p>
        </Section>

        <Section title="제5조 (재진단)">
          <p>
            상품별로 제공되는 재진단 횟수와 조건(동일 공고 한정, 해당 공고 마감일까지 등)은 각
            상품 상세 페이지에 명시된 바를 따릅니다.
          </p>
        </Section>

        <Section title="제6조 (이용자의 의무)">
          <p>
            이용자는 회원가입 시 정확한 정보를 입력해야 하며, 타인의 계정을 도용하거나 서비스를
            부정한 목적으로 이용해서는 안 됩니다.
          </p>
        </Section>

        <Section title="제7조 (면책조항)">
          <p>
            서비스가 제공하는 진단 결과는 공고 원문과 공개된 평가 기준에 근거한 참고 자료이며,
            실제 심사 결과나 선정 여부를 보장하지 않습니다. 회사는 이용자가 진단 결과를 근거로 내린
            판단에 대해 책임지지 않습니다.
          </p>
        </Section>

        <Section title="제8조 (준거법 및 관할)">
          <p>이 약관과 관련한 분쟁은 대한민국 법을 준거법으로 하며, 관할 법원은 관계 법령에 따릅니다.</p>
        </Section>

        <p className="border-t border-neutral-200 pt-6 text-xs text-neutral-400">
          사업자정보(상호·대표자·사업자등록번호·통신판매업 신고번호)는 통신판매업 신고 완료 후 이
          문서에 반영됩니다.
        </p>
      </div>
    </AppShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-navy-900">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
