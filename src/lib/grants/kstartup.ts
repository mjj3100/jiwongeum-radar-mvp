import 'server-only'
import type { GrantListingInsert } from './types'

const ENDPOINT = 'https://apis.data.go.kr/B552735/kisedKstartupService01/getAnnouncementInformation01'

interface KStartupRecord {
  pbanc_sn: number
  biz_pbanc_nm: string
  intg_pbanc_biz_nm: string
  pbanc_ntrp_nm: string | null
  pbanc_rcpt_bgng_dt: string | null
  pbanc_rcpt_end_dt: string | null
  aply_trgt: string | null
  aply_trgt_ctnt: string | null
  aply_excl_trgt_ctnt: string | null
  pbanc_ctnt: string | null
  prfn_matr: string | null
  supt_regin: string | null
  detl_pg_url: string | null
  rcrt_prgs_yn: string | null
}

interface KStartupResponse {
  currentCount: number
  data: KStartupRecord[]
  matchCount: number
  page: number
  perPage: number
  totalCount: number
}

function toIsoDate(yyyymmdd: string | null): string | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

function toRegionScope(suptRegin: string | null): string[] | null {
  if (!suptRegin || suptRegin.includes('전국')) return null
  return suptRegin.split(',').map((s) => s.trim()).filter(Boolean)
}

/**
 * K-Startup 오픈API에서 현재 접수 중인 공고를 가져온다.
 * 사업자상태/업종 필터는 API 필드가 우리 스키마와 깔끔하게 대응되지 않아
 * 규칙기반 하드필터에 쓰지 않고 null로 둔다 (2차 Claude 판단에 맡김 — spec.md §6 원칙).
 */
export async function fetchKStartupListings(maxPages = 5): Promise<GrantListingInsert[]> {
  const apiKey = process.env.KSTARTUP_API_KEY
  if (!apiKey) {
    console.warn('[kstartup] KSTARTUP_API_KEY 미설정 — 스킵')
    return []
  }

  const today = new Date().toISOString().slice(0, 10)
  const results: GrantListingInsert[] = []

  for (let page = 1; page <= maxPages; page++) {
    const url = new URL(ENDPOINT)
    url.searchParams.set('serviceKey', apiKey)
    url.searchParams.set('page', String(page))
    url.searchParams.set('perPage', '100')
    url.searchParams.set('returnType', 'json')

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.error(`[kstartup] page ${page} 요청 실패: ${res.status}`)
      break
    }

    const json = (await res.json()) as KStartupResponse
    if (!json.data || json.data.length === 0) break

    for (const rec of json.data) {
      if (rec.rcrt_prgs_yn !== 'Y') continue
      const applyEnd = toIsoDate(rec.pbanc_rcpt_end_dt)
      if (applyEnd && applyEnd < today) continue

      results.push({
        source: 'kstartup',
        external_id: String(rec.pbanc_sn),
        title: (rec.biz_pbanc_nm || rec.intg_pbanc_biz_nm || '').trim(),
        agency: rec.pbanc_ntrp_nm?.trim() || null,
        apply_start: toIsoDate(rec.pbanc_rcpt_bgng_dt),
        apply_end: applyEnd,
        target_desc: rec.aply_trgt_ctnt || rec.aply_trgt || null,
        exclude_desc: rec.aply_excl_trgt_ctnt,
        support_content: rec.pbanc_ctnt,
        support_scale: rec.prfn_matr,
        region_scope: toRegionScope(rec.supt_regin),
        industry_scope: null,
        founder_stage_scope: null,
        original_url: rec.detl_pg_url,
        raw: rec,
      })
    }

    if (json.data.length < 100) break // 마지막 페이지
  }

  return results
}
