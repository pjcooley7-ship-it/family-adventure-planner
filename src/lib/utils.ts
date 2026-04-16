export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('')
}
