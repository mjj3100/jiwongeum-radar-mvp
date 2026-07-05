import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchKStartupListings } from '@/lib/grants/kstartup'
import { fetchBizinfoListings } from '@/lib/grants/bizinfo'

export const maxDuration = 60

/**
 * K-Startup/기업마당 오픈API에서 현재 접수 중인 공고를 가져와 grant_listings에 upsert한다.
 * Vercel Cron이 주기적으로 호출하며, CRON_SECRET으로 인증된 요청만 허용한다
 * (Vercel은 crons 설정 시 Authorization: Bearer $CRON_SECRET 헤더를 자동으로 붙인다).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [kstartup, bizinfo] = await Promise.all([
    fetchKStartupListings().catch((err) => {
      console.error('[grants/sync] K-Startup 조회 실패:', err)
      return []
    }),
    fetchBizinfoListings().catch((err) => {
      console.error('[grants/sync] 기업마당 조회 실패:', err)
      return []
    }),
  ])

  const combined = [...kstartup, ...bizinfo]
  const admin = createAdminClient()

  let upserted = 0
  const errors: string[] = []

  // 대량 upsert는 배치로 나눠 보낸다 (요청 크기/타임아웃 방지).
  const BATCH_SIZE = 200
  for (let i = 0; i < combined.length; i += BATCH_SIZE) {
    const batch = combined.slice(i, i + BATCH_SIZE)
    const { error, count } = await admin
      .from('grant_listings')
      .upsert(batch, { onConflict: 'source,external_id', count: 'exact' })

    if (error) {
      errors.push(error.message)
      console.error('[grants/sync] upsert 실패:', error.message)
    } else {
      upserted += count ?? batch.length
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    fetched: { kstartup: kstartup.length, bizinfo: bizinfo.length },
    upserted,
    errors: errors.length > 0 ? errors : undefined,
  })
}
