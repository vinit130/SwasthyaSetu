/**
 * SwasthyaSetu Frontend Validation Utilities
 * Enforces Indian healthcare standards & 10-digit mobile number rules
 */

/**
 * Validates Indian 10-digit mobile number starting with 6, 7, 8, or 9
 * Rejects numbers < 10, > 10 digits, and non-numeric chars
 */
export function validateIndianPhone(phone) {
  if (!phone) return false;
  const clean = String(phone).replace(/[\s\-+]/g, '');
  // If starts with 91 and has 12 digits, strip 91
  let normalized = clean;
  if (normalized.startsWith('91') && normalized.length === 12) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = normalized.slice(1);
  }
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Normalizes phone input to clean 10-digit string
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return clean.slice(0, 10);
}

/**
 * Formats a 10-digit phone for human display: +91 98765 43210
 */
export function formatIndianPhone(phone) {
  const clean = normalizePhone(phone);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}

/**
 * Validates referral token format: SS-REF-YYYY-XXXXXX
 */
export function validateReferralToken(token) {
  if (!token) return false;
  return /^SS-REF-\d{4}-[A-Z0-9]{6}$/.test(token.trim().toUpperCase());
}
