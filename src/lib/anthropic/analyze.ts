import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { BusinessProfileInput, GrantListing, AnalyzeResult } from '@/lib/types'
import { GUARDRAIL_SYSTEM_PROMPT, containsBannedPhrase } from './guardrail'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-5'

const matchSchema = z.object({
  grant_listing_id: z.string(),
  verdict: z.enum(['추천', '조건부', '확인 필요', '비추천']),
  fit_reason: z.string(),
  caution_note: z.string().nullable(),
  prep_priority: z.number().int(),
})

const axisReasonsSchema = z.object({
  relevance: z.string(),
  concreteness: z.string(),
  differentiation: z.string(),
  feasibility: z.string(),
})

const diagnosisSchema = z.object({
  relevance_score: z.number().int().min(0).max(25),
  concreteness_score: z.number().int().min(0).max(25),
  differentiation_score: z.number().int().min(0).max(25),
  feasibility_score: z.number().int().min(0).max(25),
  axis_reasons: axisReasonsSchema,
  risk_sentences: z.array(
    z.object({ quote: z.string(), reason: z.string(), suggestion: z.string() })
  ),
  summary: z.string(),
})

const responseSchema = z.object({
  matches: z.array(matchSchema).max(5),
  diagnosis: diagnosisSchema.nullable(),
})

// 전자책 PART 6 페르소나 사례를 few-shot으로 제공 (판정 로직의 근거).
const FEW_SHOT_EXAMPLE = `
예시 (전자책 PART 6, 이민재 — AI 리뷰 분석 SaaS 'AI로컬리뷰'):
조건: 서울 마포구 / 개인사업자 / 업력 2년 / 1인 마케팅 대행업 / 연매출 8,000만원 / 리뷰 분석 리포트 5개 매장 테스트 완료

- "혁신 소상공인 AI활용지원 사업" → 추천: AI 활용과 소상공인 문제 해결이 직접 연결됨. 단, 공급기업이 아니라 AI를 활용해 서비스를 고도화하는 소상공인 관점으로 설명 필요.
- "서울 유니콘 챌린지" → 조건부: AI SaaS로 확장성·시장성을 보여줄 수 있으면 적합. 대행업처럼 보이면 약함.
- "소상공인 정책자금" → 조건부: 운영·개발자금 확보 가능. 융자이므로 상환계획과 자금 목적 확인 필요.

미니 4축 예비진단 샘플 (동일 사례, 점수와 사유를 함께 제시):
- 관련성 22/25: AI 활용과 소상공인 문제 해결이 직접 연결되어 있어 공고 취지에 부합함
- 구체성 16/25: 기능·일정은 제시했으나 고객검증 수치(사용자 수·재구매율 등)가 부족함
- 차별성 17/25: 마케팅 대행업과 SaaS 상품의 차별점을 아직 명확히 구분하지 못함
- 실현가능성 18/25: 5개 매장 수동 테스트 경험은 있으나 개발 견적·일정 보강이 필요함
- 합계 73/100: 신청 검토 가능. 단, 실행계획·차별성 보강 필요
`.trim()

// 실제 공고 원문(target_desc/support_content 등)은 API 소스마다 길이 편차가 커서,
// 그대로 다 넣으면 프롬프트가 비대해져 응답이 max_tokens에서 잘릴 수 있다.
// 판정에 필요한 핵심만 남기고 잘라낸다.
function truncate(text: string | null, maxLen: number, fallback = '미상'): string {
  if (!text) return fallback
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > maxLen ? `${clean.slice(0, maxLen)}…` : clean
}

function buildUserPrompt(profile: BusinessProfileInput, candidates: GrantListing[]): string {
  const candidateBlock = candidates
    .map(
      (c, i) => `
[공고 ${i + 1}] id=${c.id}
제목: ${truncate(c.title, 120)}
기관: ${c.agency ?? '미상'}
신청대상: ${truncate(c.target_desc, 300)}
제외대상: ${truncate(c.exclude_desc, 150, '없음')}
지원내용: ${truncate(c.support_content, 300)}
지원규모: ${truncate(c.support_scale, 150)}
`.trim()
    )
    .join('\n\n')

  return `
${FEW_SHOT_EXAMPLE}

---

이제 아래 사업자 조건과 공고 후보를 보고 같은 방식으로 판정하라.

사업자 조건:
- 사업자 상태: ${profile.founder_status}
- 연령대: ${profile.age_group} (청년창업/중장년 특화 공고 판별에 참고)
- 성별: ${profile.gender} (여성창업 특화 공고 판별에 참고, 비공개면 판별에 사용하지 말 것)
- 사업장 지역: ${profile.region}
- 업종: ${profile.industry}
- 창업일: ${profile.founded_date ?? '예비창업자(미창업)'}
- 연매출 구간: ${profile.revenue_band}
- 직원 수: ${profile.employee_count}
- 사업 아이템: ${profile.item_description}
- 필요한 지원: ${profile.support_needed}
- 준비 상태: ${profile.readiness}

공고 후보 (규칙기반 1차 필터 통과분):
${candidateBlock}

작업:
1. 위 공고 후보 중 적합도 순으로 최대 5개를 골라 각각 판정(추천/조건부/확인 필요/비추천)과 이유(fit_reason),
   주의조건(caution_note, 없으면 null), 준비우선순위(prep_priority, 1이 가장 급함)를 매겨라.
2. 가장 적합한 1개 공고(1순위)에 대해 미니 4축(관련성/구체성/차별성/실현가능성, 각 0~25점) 예비진단을 하라.
   각 축마다 "왜 이 점수인지"를 1문장으로 설명하는 사유(axis_reasons)를 반드시 함께 작성하라 —
   점수만 보여주고 이유를 안 주면 사용자가 무엇을 보완해야 할지 알 수 없다.
   위험 문장이 있다면 사업 아이템 설명에서 지적하라(risk_sentences). 요약(summary)도 작성하라.
   후보가 하나도 없으면 diagnosis는 null로 하라.

다음 JSON 스키마로만 응답하라 (다른 텍스트 없이 JSON만):
{
  "matches": [{"grant_listing_id": string, "verdict": string, "fit_reason": string, "caution_note": string|null, "prep_priority": number}],
  "diagnosis": {"relevance_score": number, "concreteness_score": number, "differentiation_score": number, "feasibility_score": number, "axis_reasons": {"relevance": string, "concreteness": string, "differentiation": string, "feasibility": string}, "risk_sentences": [{"quote": string, "reason": string, "suggestion": string}], "summary": string} | null
}
`.trim()
}

function extractJson(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Claude 응답에서 JSON을 찾지 못했습니다.')
  return JSON.parse(text.slice(start, end + 1))
}

async function callClaude(profile: BusinessProfileInput, candidates: GrantListing[]) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: GUARDRAIL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(profile, candidates) }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('Claude 응답에 텍스트가 없습니다.')

  return responseSchema.parse(extractJson(textBlock.text))
}

/**
 * 규칙필터를 통과한 공고 후보 + 사업자 조건으로 매칭/진단을 생성한다.
 * 위험 표현이 감지되면 1회 재생성을 시도하고, 그래도 남으면 안전 문구로 대체한다.
 */
export async function analyzeGrants(
  profile: BusinessProfileInput,
  candidates: GrantListing[]
): Promise<AnalyzeResult> {
  if (candidates.length === 0) {
    return { matches: [], diagnosis: null }
  }

  let parsed = await callClaude(profile, candidates)

  const flatText = [
    ...parsed.matches.flatMap((m) => [m.fit_reason, m.caution_note ?? '']),
    parsed.diagnosis?.summary ?? '',
    ...(parsed.diagnosis ? Object.values(parsed.diagnosis.axis_reasons) : []),
  ].join('\n')

  if (containsBannedPhrase(flatText)) {
    parsed = await callClaude(profile, candidates)
  }

  const sanitize = (s: string) =>
    containsBannedPhrase(s) ? '표현을 확인 중입니다. 준비도 점검 결과를 참고해주세요.' : s

  return {
    matches: parsed.matches.map((m) => ({
      grant_listing_id: m.grant_listing_id,
      title: candidates.find((c) => c.id === m.grant_listing_id)?.title ?? '',
      verdict: m.verdict,
      fit_reason: sanitize(m.fit_reason),
      caution_note: m.caution_note ? sanitize(m.caution_note) : null,
      prep_priority: m.prep_priority,
    })),
    diagnosis: parsed.diagnosis
      ? {
          relevance_score: parsed.diagnosis.relevance_score,
          concreteness_score: parsed.diagnosis.concreteness_score,
          differentiation_score: parsed.diagnosis.differentiation_score,
          feasibility_score: parsed.diagnosis.feasibility_score,
          total_score:
            parsed.diagnosis.relevance_score +
            parsed.diagnosis.concreteness_score +
            parsed.diagnosis.differentiation_score +
            parsed.diagnosis.feasibility_score,
          axis_reasons: {
            relevance: sanitize(parsed.diagnosis.axis_reasons.relevance),
            concreteness: sanitize(parsed.diagnosis.axis_reasons.concreteness),
            differentiation: sanitize(parsed.diagnosis.axis_reasons.differentiation),
            feasibility: sanitize(parsed.diagnosis.axis_reasons.feasibility),
          },
          risk_sentences: parsed.diagnosis.risk_sentences,
          summary: sanitize(parsed.diagnosis.summary),
        }
      : null,
  }
}
