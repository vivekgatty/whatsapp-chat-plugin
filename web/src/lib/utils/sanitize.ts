const TAG_RE = /<[^>]*>/g;
const CTRL_RE = /[\u0000-\u001F\u007F]/g;

export function sanitizeText(input: unknown, maxLen = 1000): string {
  const text = String(input ?? "")
    .replace(TAG_RE, " ")
    .replace(CTRL_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, maxLen);
}
