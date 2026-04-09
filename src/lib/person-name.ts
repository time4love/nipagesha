/**
 * Normalize first name for matching (search vs stored card).
 * Trims, Unicode NFC, lowercase for Latin letters (Hebrew unchanged).
 */
export function normalizePersonName(value: string): string {
  return value.trim().normalize("NFC").toLowerCase();
}
