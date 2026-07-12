'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runAnalysisForUser, analyzeErrorMessage } from '@/lib/analyze-service'
import type { BusinessProfileInput } from '@/lib/types'

export async function submitBusinessProfile(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const founded = String(formData.get('founded_date') || '').trim()

  const profile: BusinessProfileInput = {
    founder_status: String(formData.get('founder_status') || '') as BusinessProfileInput['founder_status'],
    region: String(formData.get('region') || '').trim(),
    industry: String(formData.get('industry') || '').trim(),
    founded_date: founded || null,
    revenue_band: String(formData.get('revenue_band') || '') as BusinessProfileInput['revenue_band'],
    employee_count: String(formData.get('employee_count') || '') as BusinessProfileInput['employee_count'],
    item_description: String(formData.get('item_description') || '').trim(),
    support_needed: String(formData.get('support_needed') || '') as BusinessProfileInput['support_needed'],
    readiness: String(formData.get('readiness') || '') as BusinessProfileInput['readiness'],
    age_group: String(formData.get('age_group') || '') as BusinessProfileInput['age_group'],
    gender: String(formData.get('gender') || '') as BusinessProfileInput['gender'],
  }

  if (!profile.region || !profile.industry || !profile.item_description || !profile.age_group || !profile.gender) {
    return { error: '필수 항목을 모두 입력해주세요.' }
  }

  const admin = createAdminClient()
  const { error: upsertError } = await admin
    .from('business_profiles')
    .upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() })

  if (upsertError) {
    return { error: '사업 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }

  const outcome = await runAnalysisForUser(user.id)
  if (!outcome.ok) {
    return { error: analyzeErrorMessage(outcome.error) }
  }

  // revalidatePath만으로는 URL의 ?edit=1이 그대로 남아 있어, /result/page.tsx의
  // edit===1 분기가 매번 다시 폼을 보여주는 문제가 있었다(분석이 성공해도 결과
  // 화면 대신 폼으로 되돌아가는 것처럼 보임). edit 파라미터를 없앤 /result로
  // 명시적으로 이동시켜야 결과 화면이 실제로 렌더링된다.
  revalidatePath('/result')
  redirect('/result')
}
