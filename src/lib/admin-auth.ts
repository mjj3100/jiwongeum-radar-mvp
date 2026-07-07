import 'server-only'

/**
 * ADMIN_EMAILS는 콤마로 구분된 허용 이메일 목록이다. 지금은 운영자 1인이지만
 * 나중에 늘어날 수 있어 배열로 둔다.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.trim().toLowerCase())
}
