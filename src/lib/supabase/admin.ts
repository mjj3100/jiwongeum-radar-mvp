import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role 클라이언트. RLS를 우회하므로 서버 전용 코드(Route Handler,
 * RPC 호출 등)에서만 사용한다. 절대 클라이언트 컴포넌트나 브라우저로 전달하지 않는다.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
