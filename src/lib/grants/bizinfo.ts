import 'server-only'
import { XMLParser } from 'fast-xml-parser'
import type { GrantListingInsert } from './types'

const ENDPOINT = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'

interface BizinfoItem {
  pblancNm?: string
  title?: string
  pblancUrl?: string
  link?: string
  pblancId?: string
  seq?: string
  author?: string
  excInsttNm?: string
  description?: string
  trgetNm?: string
  reqstDt?: string
  lcategory?: string
}

function parseReqstDt(reqstDt: string | undefined): { start: string | null; end: string | null } {
  if (!reqstDt) return { start: null, end: null }
  const match = reqstDt.match(/(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})/)
  if (!match) return { start: null, end: null }
  return { start: match[1], end: match[2] }
}

function stripHtml(html: string | undefined): string | null {
  if (!html) return null
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || null
}

/**
 * 기업마당 오픈API에서 공고를 가져온다. RSS/XML 응답을 파싱한다.
 * region/founder_stage 필드가 명확하지 않아 null로 두고 2차 Claude 판단에 맡긴다.
 */
export async function fetchBizinfoListings(count = 100): Promise<GrantListingInsert[]> {
  const apiKey = process.env.BIZINFO_API_KEY
  if (!apiKey) {
    console.warn('[bizinfo] BIZINFO_API_KEY 미설정 — 스킵')
    return []
  }

  const url = new URL(ENDPOINT)
  url.searchParams.set('crtfcKey', apiKey)
  url.searchParams.set('searchCnt', String(count))

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    console.error(`[bizinfo] 요청 실패: ${res.status}`)
    return []
  }

  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: true })
  const parsed = parser.parse(xml)

  const rawItems = parsed?.rss?.channel?.item
  const items: BizinfoItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : []

  const today = new Date().toISOString().slice(0, 10)
  const results: GrantListingInsert[] = []

  for (const item of items) {
    const { start, end } = parseReqstDt(item.reqstDt)
    if (end && end < today) continue

    const id = item.pblancId || item.seq
    if (!id) continue

    results.push({
      source: 'bizinfo',
      external_id: String(id),
      title: (item.pblancNm || item.title || '').trim(),
      agency: item.author?.trim() || null,
      apply_start: start,
      apply_end: end,
      target_desc: item.trgetNm || null,
      exclude_desc: null,
      support_content: stripHtml(item.description),
      support_scale: null,
      region_scope: null,
      industry_scope: item.lcategory ? [item.lcategory.trim()] : null,
      founder_stage_scope: null,
      original_url: item.pblancUrl || item.link || null,
      raw: item,
    })
  }

  return results
}
