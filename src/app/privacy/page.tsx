import { AppShell } from '@/components/AppShell'

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-10 text-neutral-700">
        <div>
          <p className="eyebrow text-teal-dark">PRIVACY</p>
          <h1 className="mt-2 text-2xl font-extrabold text-navy-900">개인정보처리방침</h1>
          <p className="mt-2 text-sm text-neutral-400">시행일: [사업자 등록 완료 후 확정 예정]</p>
        </div>

        <Section title="1. 수집하는 개인정보 항목">
          <p>
            회원가입 시 이메일·비밀번호를 수집하며, 맞춤 진단을 위해 아래 사업 정보를 추가로
            수집합니다: 나이대, 성별, 창업 상태(예비창업자/개인사업자/법인사업자/소상공인), 사업장
            소재지, 업종, 설립일, 매출구간, 직원 수, 사업 아이템 설명, 필요 지원 형태, 준비도.
          </p>
          <p className="mt-2">
            19,900원 이상 진단 상품 이용 시 사업계획서 원문(텍스트 또는 첨부파일)을 추가로 수집합니다.
          </p>
        </Section>

        <Section title="2. 수집 및 이용 목적">
          <p>
            회원 식별 및 결제 이용권 확인, 입력하신 조건에 맞는 지원사업 매칭, 제출 전 준비도
            진단(4축 채점·위험 문장 점검) 제공을 위해 사용합니다. 다른 목적으로 이용하지 않습니다.
          </p>
        </Section>

        <Section title="3. 보유 및 이용 기간">
          <p>
            회원 탈퇴 시 지체 없이 파기합니다. 단, 전자상거래법 등 관계 법령에 따라 보존이 필요한
            거래 기록은 해당 법령이 정한 기간 동안 보관합니다.
          </p>
        </Section>

        <Section title="4. AI 분석을 위한 처리위탁">
          <p>
            입력하신 사업 정보와 사업계획서 원문은 진단 생성을 위해 Anthropic PBC(Claude API)로
            전송됩니다. 전송된 내용은 모델 학습에 사용되지 않으며, 진단 결과 생성 목적으로만
            일시적으로 처리됩니다.
          </p>
        </Section>

        <Section title="5. 이용자의 권리">
          <p>
            언제든지 본인의 개인정보 열람·정정·삭제를 요청할 수 있습니다. 요청 방법은 하단 문의
            채널을 통해 접수하며, 접수 후 지체 없이 처리합니다.
          </p>
        </Section>

        <Section title="6. 만 14세 미만 아동">
          <p>본 서비스는 만 14세 미만 아동의 개인정보를 수집하지 않습니다.</p>
        </Section>

        <Section title="7. 문의처">
          <p>개인정보 관련 문의는 하단 CS 채널(오픈카톡, 준비 중)로 접수해 주세요.</p>
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
