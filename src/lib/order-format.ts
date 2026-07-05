/**
 * 리틀리 주문번호 형식검증: 숫자 16자리. 공백·하이픈은 자동 제거한다.
 * (§4 SETUP.md, §9 실결제 검수에서 실제 형식이 다르면 이 정규식만 조정할 것)
 */
export function normalizeOrderNo(raw: string): string {
  return raw.replace(/[\s-]/g, '')
}

export function isValidOrderNo(raw: string): boolean {
  const normalized = normalizeOrderNo(raw)
  return /^\d{16}$/.test(normalized)
}
