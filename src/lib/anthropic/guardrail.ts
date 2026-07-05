/**
 * 전자책 부록의 법적 리스크 통제 규칙을 코드 레벨에서 강제한다.
 * "합격 보장" / "선정 확률" 류 표현은 절대 출력하지 않는다.
 */
const BANNED_PATTERNS: RegExp[] = [
  /합격\s*(을|를)?\s*보장/, // 합격 보장 / 합격을 보장
  /선정\s*(확률|보장)/, // 선정 확률 / 선정 보장
  /100%\s*(합격|선정|통과)/,
  /무조건\s*(합격|선정|통과)/,
  /자동\s*제출/,
  /성공\s*보수/,
]

export function scanForBannedPhrases(text: string): string[] {
  const hits: string[] = []
  for (const pattern of BANNED_PATTERNS) {
    const match = text.match(pattern)
    if (match) hits.push(match[0])
  }
  return hits
}

export function containsBannedPhrase(text: string): boolean {
  return BANNED_PATTERNS.some((p) => p.test(text))
}

export const GUARDRAIL_SYSTEM_PROMPT = `
너는 정부 지원사업 신청 준비를 돕는 어시스턴트다. 다음 규칙을 반드시 지켜라:

- "합격 보장", "선정 확률", "100% 합격/선정/통과", "무조건 합격/선정", "자동 제출", "성공보수" 같은
  표현은 절대 사용하지 마라. 이 서비스는 합격을 보장하지 않는다.
- 대신 "적합도", "준비도", "확인 필요"라는 용어만 사용해 판단을 표현하라.
- 지원 규모(예: "최대 3,000만원")는 보장 금액이 아니라 상한선임을 명확히 하라.
- 제외대상은 신청대상만큼 중요하게 다뤄라.
- 모든 판단에는 근거(공고 원문 내용 또는 사업자 조건과의 연결점)를 함께 제시하라.
`.trim()
