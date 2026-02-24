/**
 * Normalise a phone number to the format Meta expects: digits only, no +.
 * e.g. "+91 98765 43210" → "919876543210"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Format a normalised WA ID (e.g. "919876543210") for display.
 * Returns "+91 98765 43210" for Indian numbers.
 */
export function formatPhone(waId: string): string {
  if (!waId) return "";

  if (waId.startsWith("91") && waId.length === 12) {
    return `+91 ${waId.slice(2, 7)} ${waId.slice(7)}`;
  }

  return `+${waId}`;
}

/**
 * Basic phone number validation: must be at least 10 digits.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Extract country code from a normalised phone number.
 */
export function getCountryCode(waId: string): string {
  if (waId.startsWith("91")) return "IN";
  if (waId.startsWith("1")) return "US";
  if (waId.startsWith("44")) return "GB";
  return "UNKNOWN";
}
