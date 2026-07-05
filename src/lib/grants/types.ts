export interface GrantListingInsert {
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
  raw: unknown
}
