export function foldToLatin(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '')
}
