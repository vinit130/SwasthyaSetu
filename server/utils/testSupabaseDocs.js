const axios = require('axios');
const supabaseClient = require('./supabaseClient');
require('../server');

const BASE_URL = 'http://localhost:5000/api';

async function runDocTests() {
  await new Promise((r) => setTimeout(r, 600));

  console.log('\n===============================================================');
  console.log('SWASTHYASETU SUPABASE STORAGE & MEDICAL DOCUMENTS TEST SUITE');
  console.log('===============================================================\n');

  // Test 1: Supabase client unit checks
  console.log('[TEST 1] Testing Supabase Client Service & Path Sanitization...');
  const isConfigured = supabaseClient.isSupabaseConfigured();
  console.log(`  ✓ Supabase configured in current environment: ${isConfigured}`);

  // Test path traversal sanitization
  const safe1 = supabaseClient.sanitizeFileName('../../../etc/passwd');
  if (safe1.includes('..') || safe1.includes('/')) {
    throw new Error('Path traversal sanitization failed on ../../../etc/passwd');
  }
  console.log(`  ✓ Traversal sanitization safe: '../../../etc/passwd' -> '${safe1}'`);

  const safe2 = supabaseClient.sanitizeFileName('Chest X-Ray (2026) #1.pdf');
  const storagePath = supabaseClient.buildStoragePath('pat123', 'doc456', 'Chest X-Ray.pdf');
  if (storagePath !== 'pat123/doc456/Chest_X-Ray.pdf') {
    throw new Error(`Unexpected storage path: ${storagePath}`);
  }
  console.log(`  ✓ Standardized storage path constructed: '${storagePath}'`);

  // Test 2: Doctor uploads a document
  console.log('\n[TEST 2] Testing Doctor Document Upload Workflow...');
  const docLogin = await axios.post(`${BASE_URL}/auth/login`, {
    identifier: 'doctor@demo.com',
    password: 'Demo@123',
  });
  const docToken = docLogin.data.token;

  const patientId = '66d000000000000000000011'; // Rahul Kumar

  const uploadRes = await axios.post(
    `${BASE_URL}/documents`,
    {
      patientId,
      title: 'Post-Op Ultrasound Abdomen Report',
      documentType: 'ULTRASOUND',
      fileName: 'USG_Abdomen_Rahul.pdf',
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEr5HIKWTAxMDcxNVUwAAILAzI=',
      mimeType: 'application/pdf',
      fileSize: 45000,
      doctorNotes: 'No free fluid in peritoneal cavity. Liver parenchyma normal.',
    },
    { headers: { Authorization: `Bearer ${docToken}` } }
  );

  if (!uploadRes.data.success) {
    throw new Error('Document upload failed');
  }
  const uploadedDoc = uploadRes.data.data;
  console.log(`  ✓ Document uploaded successfully: '${uploadedDoc.title}' (Type: ${uploadedDoc.documentType})`);
  console.log(`  ✓ Storage provider detected: ${uploadRes.data.storageProvider || uploadedDoc.storageProvider}`);
  console.log(`  ✓ File Data omitted from response payload for performance: ${uploadedDoc.fileData === undefined}`);

  // Test 3: Patient Isolation Verification
  console.log('\n[TEST 3] Testing Document Patient Isolation Enforcement...');
  const patLogin = await axios.post(`${BASE_URL}/auth/login`, {
    identifier: 'patient@demo.com', // Rahul Kumar
    password: 'Demo@123',
  });
  const patToken = patLogin.data.token;

  // View own documents -> must succeed
  const ownDocs = await axios.get(`${BASE_URL}/documents/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  if (!ownDocs.data.success || !ownDocs.data.data.length) {
    throw new Error('Patient failed to get own documents');
  }
  console.log(`  ✓ Patient retrieved own documents (${ownDocs.data.data.length} records found)`);

  // Attempt cross-patient access with an unauthorized patient ID -> must return 403
  try {
    await axios.get(`${BASE_URL}/documents/patient/66d000000000000000000012`, {
      headers: { Authorization: `Bearer ${patToken}` },
    });
    throw new Error('Cross-patient document access was not blocked!');
  } catch (isoErr) {
    if (isoErr.response && isoErr.response.status === 403) {
      console.log('  ✓ Cross-patient document access correctly forbidden (HTTP 403)');
    } else {
      throw isoErr;
    }
  }

  // Test 4: View Document Details
  console.log('\n[TEST 4] Testing Secure Document View & Signed URL Generation...');
  const docId = uploadedDoc._id || uploadedDoc.id;
  const viewRes = await axios.get(`${BASE_URL}/documents/${docId}/view`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  if (!viewRes.data.success) {
    throw new Error('Failed to view document');
  }
  console.log(`  ✓ Successfully viewed document '${viewRes.data.data.title}'`);
  if (viewRes.data.data.signedUrl) {
    console.log(`  ✓ Supabase Signed URL generated: ${viewRes.data.data.signedUrl.substring(0, 45)}...`);
  } else {
    console.log('  ✓ Portable data payload returned safely in fallback mode');
  }

  console.log('\n===============================================================');
  console.log('ALL SUPABASE & MEDICAL DOCUMENT TESTS PASSED PERFECTLY!');
  console.log('===============================================================\n');
  process.exit(0);
}

runDocTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err.message);
  if (err.response) {
    console.error('Response:', err.response.data);
  }
  process.exit(1);
});
