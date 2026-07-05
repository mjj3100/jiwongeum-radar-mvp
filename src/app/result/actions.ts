'use server'

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

  revalidatePath('/result')
}

export async function rerunAnalysis(): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요합니다.' }

  const outcome = await runAnalysisForUser(user.id)
  if (!outcome.ok) {
    return { error: analyzeErrorMessage(outcome.error) }
  }

  revalidatePath('/result')
  revalidatePath('/dashboard')
}
