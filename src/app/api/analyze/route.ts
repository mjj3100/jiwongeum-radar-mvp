import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAnalysisForUser } from '@/lib/analyze-service'

const STATUS_BY_ERROR = { no_entitlement: 403, no_business_profile: 400, analysis_failed: 502 } as const

export async function POST() {
  const supabase = await createClient()
  // getUser()로 서버에서 재검증한다. 쿠키만 파싱하는 getSession()은 위조 가능해 인가 판단에 쓰지 않는다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const outcome = await runAnalysisForUser(user.id)

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: STATUS_BY_ERROR[outcome.error] })
  }

  return NextResponse.json(outcome.result)
}
