export type FounderStatus = '예비창업자' | '개인사업자' | '법인사업자' | '소상공인'

export type RevenueBand = '없음' | '5천만미만' | '1억미만' | '3억미만' | '3억이상'

export type EmployeeCount = '1인' | '2~4명' | '5명이상'

export type SupportNeeded = '사업화자금' | '개발비' | '광고비' | '장비' | '공간' | '정책자금'

export type Readiness = '아이디어' | 'MVP' | '매출발생' | '제출직전'

export type AgeGroup = '20대이하' | '30대' | '40대' | '50대이상'

export type Gender = '남성' | '여성' | '비공개'

export interface BusinessProfileInput {
  founder_status: FounderStatus
  region: string
  industry: string
  founded_date: string | null
  revenue_band: RevenueBand
  employee_count: EmployeeCount
  item_description: string
  support_needed: SupportNeeded
  readiness: Readiness
  age_group: AgeGroup
  gender: Gender
}

export interface GrantListing {
  id: string
  source: 'kstartup' | 'bizinfo' | 'manual'
  external_id: string | null
  title: string
  agency: string | null
  apply_start: string | null
  apply_end: string | null
  target_desc: string | null
  exclude_desc: string | null
  support_content: string | null
  support_scale: string | null
  region_scope: string[] | null
  industry_scope: string[] | null
  founder_stage_scope: string[] | null
  original_url: string | null
}

export type Verdict = '추천' | '조건부' | '확인 필요' | '비추천'

export interface MatchResult {
  grant_listing_id: string
  title: string
  verdict: Verdict
  fit_reason: string
  caution_note: string | null
  prep_priority: number
}

export interface RiskSentence {
  quote: string
  reason: string
  suggestion: string
}

export interface DiagnosisReport {
  relevance_score: number
  concreteness_score: number
  differentiation_score: number
  feasibility_score: number
  total_score: number
  risk_sentences: RiskSentence[]
  summary: string
}

export interface AnalyzeResult {
  matches: MatchResult[]
  diagnosis: DiagnosisReport | null
}
