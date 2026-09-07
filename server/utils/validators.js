const crypto = require('crypto');

/**
 * Validates strictly 10-digit Indian mobile number starting with 6, 7, 8, or 9
 * @param {string} phone
 * @returns {boolean}
 */
function validateIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Normalizes a phone string by removing whitespace, hyphens, and +91 prefix
 * @param {string} phone
 * @returns {string}
 */
function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }
  return clean;
}

/**
 * Generates an unguessable, cryptographically secure unique referral token
 * Format: SS-REF-YYYY-XXXXXX (e.g. SS-REF-2026-8X4K29)
 * @returns {string}
 */
function generateReferralToken() {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous 0, 1, I, O
  const bytes = crypto.randomBytes(6);
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars[bytes[i] % chars.length];
  }
  return `SS-REF-${year}-${randomStr}`;
}

module.exports = {
  validateIndianPhone,
  normalizePhone,
  generateReferralToken,
};
