const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'medical-documents';

let supabaseAdmin = null;

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY &&
    !SUPABASE_URL.includes('your-project') &&
    !SUPABASE_SERVICE_ROLE_KEY.includes('your_service_role_key')
  );
}

function getClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Sanitize filename to prevent directory traversal and illegal characters
 */
function sanitizeFileName(fileName) {
  if (!fileName) return 'document.pdf';
  // Remove path separators and traversal tokens
  const base = path.basename(fileName).replace(/(\.\.[\/\\])+/g, '');
  // Replace unsafe chars with underscores
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Construct secure storage path convention:
 * medical-documents/{patientId}/{documentId}/{safeFileName}
 */
function buildStoragePath(patientId, documentId, fileName) {
  const cleanPatient = String(patientId).replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanDocId = String(documentId).replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanFile = sanitizeFileName(fileName);
  return `${cleanPatient}/${cleanDocId}/${cleanFile}`;
}

/**
 * Upload buffer to Supabase private storage bucket
 */
async function uploadToSupabase(storagePath, buffer, mimeType = 'application/pdf') {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase Storage is not configured with valid environment variables.');
  }

  const bucketName = DEFAULT_BUCKET;

  // Upload buffer to Supabase
  const { data, error } = await client.storage
    .from(bucketName)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error(`[Supabase Storage Error] Failed to upload ${storagePath}:`, error.message);
    throw error;
  }

  return {
    bucket: bucketName,
    storagePath: data.path,
    fullPath: data.fullPath,
  };
}

/**
 * Generate a short-lived signed URL for authenticated, patient-isolated download/view
 * Default expiration: 300 seconds (5 minutes)
 */
async function createSignedUrl(storagePath, expiresIn = 300) {
  const client = getClient();
  if (!client) {
    throw new Error('Supabase Storage is not configured.');
  }

  const bucketName = DEFAULT_BUCKET;
  const { data, error } = await client.storage
    .from(bucketName)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    console.error(`[Supabase Storage Error] Failed to create signed URL for ${storagePath}:`, error.message);
    throw error;
  }

  return data.signedUrl;
}

/**
 * Delete a document from Supabase storage
 */
async function deleteFromSupabase(storagePath) {
  const client = getClient();
  if (!client) return false;

  const bucketName = DEFAULT_BUCKET;
  const { error } = await client.storage.from(bucketName).remove([storagePath]);
  if (error) {
    console.error(`[Supabase Storage Error] Failed to delete ${storagePath}:`, error.message);
    return false;
  }
  return true;
}

module.exports = {
  isSupabaseConfigured,
  sanitizeFileName,
  buildStoragePath,
  uploadToSupabase,
  createSignedUrl,
  deleteFromSupabase,
  DEFAULT_BUCKET,
};
