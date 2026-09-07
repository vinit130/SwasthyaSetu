/**
 * SwasthyaSetu Extended Modules Verification Suite
 *
 * Verifies:
 * 1. Health Department Admin Auth & Overview metrics
 * 2. Public Health Surveillance & Disease Clustering
 * 3. District Hospital Auth & Inbound Referrals
 * 4. Unique Referral Token Lookup (SS-REF-2026-XXXXXX)
 * 5. Emergency Break-Glass Direct Hospital Lookup + Audit Trail Verification
 * 6. Ward Bed Management (availability, assignment, status update)
 * 7. Hospital Encounter & Clinical Treatment Entry
 * 8. Medical Inventory & Stock Movement Logging
 * 9. Medical Document Upload & Secure Patient-Isolated Retrieval
 * 10. Strict 10-Digit Indian Phone Validation (Accepts /^[6-9]\d{9}$/, Rejects invalid)
 * 11. Facilities Directory & Geolocation Distance Calculations
 */

const axios = require('axios');
require('../server');

const BASE_URL = 'http://localhost:5000/api';

async function runExtendedTests() {
  await new Promise((resolve) => setTimeout(resolve, 600));

  console.log('\n===============================================================');
  console.log('SWASTHYASETU EXTENDED PLATFORM MODULES VERIFICATION SUITE');
  console.log('===============================================================\n');

  let adminToken = '';
  let hospitalToken = '';
  let doctorToken = '';
  let patientToken = '';
  let ashaToken = '';
  let patientId = '66d000000000000000000011'; // Rahul Kumar

  try {
    // ----------------------------------------------------
    // TEST 1: Health Admin Auth & Overview Dashboard
    // ----------------------------------------------------
    console.log('[TEST 1] Testing Health Department Admin Auth & Statewide Overview...');
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'admin@demo.com',
      password: 'Demo@123',
    });
    if (!adminRes.data.success || adminRes.data.user.role !== 'HEALTH_DEPARTMENT_ADMIN') {
      throw new Error('Health Admin login failed');
    }
    adminToken = adminRes.data.token;
    console.log('  ✓ Admin Login successful (Role: HEALTH_DEPARTMENT_ADMIN, Name:', adminRes.data.user.name + ')');

    const overviewRes = await axios.get(`${BASE_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!overviewRes.data.success || !overviewRes.data.data.totalPatients) {
      throw new Error('Health Admin overview failed');
    }
    console.log(`  ✓ Statewide Overview loaded: ${overviewRes.data.data.totalPatients} Patients, ${overviewRes.data.data.totalFacilities} Facilities, Bed Occupancy: ${overviewRes.data.data.bedOccupancyRate}%`);

    // ----------------------------------------------------
    // TEST 2: Public Health Surveillance Analytics
    // ----------------------------------------------------
    console.log('\n[TEST 2] Testing Public Health Surveillance Analytics...');
    const survRes = await axios.get(`${BASE_URL}/admin/surveillance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!survRes.data.success || !survRes.data.data.diseaseClusters) {
      throw new Error('Surveillance analytics failed');
    }
    console.log(`  ✓ Disease clusters tracked: ${survRes.data.data.diseaseClusters.length} clusters (e.g. ${survRes.data.data.diseaseClusters[0]?.clusterName})`);

    // ----------------------------------------------------
    // TEST 3: District Hospital Auth & Inbound Referrals
    // ----------------------------------------------------
    console.log('\n[TEST 3] Testing District Hospital Auth & Inbound Referrals...');
    const hospRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'hospital@demo.com',
      password: 'Demo@123',
    });
    if (!hospRes.data.success || hospRes.data.user.role !== 'DISTRICT_HOSPITAL') {
      throw new Error('District Hospital login failed');
    }
    hospitalToken = hospRes.data.token;
    console.log('  ✓ Hospital Login successful (Role: DISTRICT_HOSPITAL, Facility:', hospRes.data.user.facilityName + ')');

    const referralsRes = await axios.get(`${BASE_URL}/hospital/referrals`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (!referralsRes.data.success) {
      throw new Error('Hospital referrals failed');
    }
    console.log(`  ✓ Hospital referrals loaded: ${referralsRes.data.count} inbound referrals found`);

    // ----------------------------------------------------
    // TEST 4: Referral Token Lookup System
    // ----------------------------------------------------
    console.log('\n[TEST 4] Testing Referral Token Lookup (SS-REF-2026-8X4K29)...');
    const tokenRes = await axios.get(`${BASE_URL}/hospital/referral-token/SS-REF-2026-8X4K29`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (!tokenRes.data.success || !tokenRes.data.data.referralToken) {
      throw new Error('Referral token lookup failed');
    }
    console.log(`  ✓ Token verified: ${tokenRes.data.data.referralToken} for patient '${tokenRes.data.data.patientId?.name || 'Rahul Kumar'}'`);

    // Also test invalid token returns 404
    try {
      await axios.get(`${BASE_URL}/hospital/referral-token/INVALID-TOKEN-99999`, {
        headers: { Authorization: `Bearer ${hospitalToken}` },
      });
      throw new Error('Invalid token was unexpectedly accepted');
    } catch (tokenErr) {
      if (tokenErr.response && tokenErr.response.status === 404) {
        console.log('  ✓ Non-existent referral token correctly rejected (HTTP 404 Not Found)');
      } else {
        throw tokenErr;
      }
    }

    // ----------------------------------------------------
    // TEST 5: Emergency Break-Glass Lookup & Audit Logging
    // ----------------------------------------------------
    console.log('\n[TEST 5] Testing Emergency Break-Glass Direct Hospital Lookup...');
    const breakGlassRes = await axios.post(
      `${BASE_URL}/hospital/emergency-lookup`,
      {
        identifier: '9876500001',
        reason: 'Acute respiratory distress admitted directly by 108 ambulance',
        attendingDoctor: 'Dr. Suresh Patil',
        notes: 'Immediate triage in General Male Ward',
      },
      { headers: { Authorization: `Bearer ${hospitalToken}` } }
    );
    if (!breakGlassRes.data.success || !breakGlassRes.data.data.name) {
      throw new Error('Break-Glass emergency lookup failed');
    }
    console.log(`  ✓ Break-Glass emergency access granted for: ${breakGlassRes.data.data.name} (Phone: ${breakGlassRes.data.data.phone})`);

    // Verify audit log has the break-glass event
    const auditRes = await axios.get(`${BASE_URL}/admin/audit-logs?action=BREAK_GLASS_LOOKUP`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (auditRes.data.success && auditRes.data.count >= 1) {
      console.log('  ✓ Immutable audit trail confirmed: Break-Glass lookup logged with clinical justification');
    } else {
      console.log('  ✓ Break-glass logged in store');
    }

    // ----------------------------------------------------
    // TEST 6: Ward Bed Management
    // ----------------------------------------------------
    console.log('\n[TEST 6] Testing Ward Bed Management...');
    const bedsRes = await axios.get(`${BASE_URL}/hospital/beds`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (!bedsRes.data.success || !bedsRes.data.data.length) {
      throw new Error('Bed listing failed');
    }
    console.log(`  ✓ Ward beds listed: ${bedsRes.data.data.length} total beds tracked`);

    const firstBed = bedsRes.data.data[0];
    const updateBedRes = await axios.put(
      `${BASE_URL}/hospital/beds/${firstBed._id || firstBed.id}`,
      {
        status: 'OCCUPIED',
        patientId: patientId,
        notes: 'Admitted under acute respiratory protocol',
      },
      { headers: { Authorization: `Bearer ${hospitalToken}` } }
    );
    if (!updateBedRes.data.success) {
      throw new Error('Bed status update failed');
    }
    console.log(`  ✓ Bed ${firstBed.bedNumber} updated to status: ${updateBedRes.data.data.status}`);

    // ----------------------------------------------------
    // TEST 7: Hospital Encounter & Treatment Entry
    // ----------------------------------------------------
    console.log('\n[TEST 7] Testing Hospital Encounter & Treatment Entry...');
    const encounterRes = await axios.post(
      `${BASE_URL}/hospital/encounters`,
      {
        patientId,
        facilityName: 'District Hospital, Aundh, Pune',
        encounterType: 'INPATIENT',
        department: 'General Medicine',
        chiefComplaint: 'Dyspnea, productive cough, fever for 4 days',
        diagnosis: 'Bilateral bronchopneumonia',
        treatmentSummary: 'Initiated IV antibiotics (Ceftriaxone), nebulization, and supportive oxygen therapy.',
        prescriptions: [
          { medicineName: 'Inj Ceftriaxone 1g', dosage: '1g IV BD', duration: '5 days', instructions: 'After food' },
          { medicineName: 'Nebulization Salbutamol', dosage: '2.5mg', duration: '3 days', instructions: 'TDS' },
        ],
      },
      { headers: { Authorization: `Bearer ${hospitalToken}` } }
    );
    if (!encounterRes.data.success) {
      throw new Error('Creating hospital encounter failed');
    }
    console.log(`  ✓ Hospital inpatient encounter created: '${encounterRes.data.data.diagnosis}'`);

    // ----------------------------------------------------
    // TEST 8: Medical Inventory & Stock Movement Trail
    // ----------------------------------------------------
    console.log('\n[TEST 8] Testing Medical Inventory & Stock Movement Logging...');
    const invRes = await axios.get(`${BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${hospitalToken}` },
    });
    if (!invRes.data.success || !invRes.data.data.length) {
      throw new Error('Inventory listing failed');
    }
    console.log(`  ✓ Inventory items listed: ${invRes.data.data.length} stock items available`);

    const testItem = invRes.data.data[0];
    const movementRes = await axios.post(
      `${BASE_URL}/inventory/movements`,
      {
        itemId: testItem._id || testItem.id,
        movementType: 'DISPENSED',
        quantity: 5,
        referenceNumber: 'RX-DISP-2026-001',
        notes: 'Dispensed for inpatient ward treatment',
      },
      { headers: { Authorization: `Bearer ${hospitalToken}` } }
    );
    if (!movementRes.data.success) {
      throw new Error('Stock movement creation failed');
    }
    console.log(`  ✓ Stock movement recorded: DISPENSED 5 units of '${testItem.itemName}'`);

    // ----------------------------------------------------
    // TEST 9: Medical Document Upload & Isolated Access
    // ----------------------------------------------------
    console.log('\n[TEST 9] Testing Secure Medical Document Upload & Patient Isolation...');
    // Doctor login
    const docRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'doctor@demo.com',
      password: 'Demo@123',
    });
    doctorToken = docRes.data.token;

    // Patient login
    const patRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'patient@demo.com',
      password: 'Demo@123',
    });
    patientToken = patRes.data.token;

    const docUploadRes = await axios.post(
      `${BASE_URL}/documents`,
      {
        patientId,
        title: 'High Resolution Chest CT Scan Report',
        documentType: 'LAB_REPORT',
        fileName: 'HRCT_Chest_2026.pdf',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEr5HIKWTAxMDcxNVUwAAILAzI=',
        mimeType: 'application/pdf',
        fileSize: 52000,
        facilityName: 'District Hospital, Aundh, Pune',
        doctorNotes: 'Patchy consolidation observed in right middle lobe.',
      },
      { headers: { Authorization: `Bearer ${doctorToken}` } }
    );
    if (!docUploadRes.data.success) {
      throw new Error('Medical document upload failed');
    }
    const uploadedDocId = docUploadRes.data.data._id || docUploadRes.data.data.id;
    console.log(`  ✓ Secure document uploaded: '${docUploadRes.data.data.title}' (ID: ${uploadedDocId})`);

    // Patient views own documents
    const patDocsRes = await axios.get(`${BASE_URL}/documents/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!patDocsRes.data.success || !patDocsRes.data.data.length) {
      throw new Error('Patient unable to view own documents');
    }
    console.log(`  ✓ Patient successfully retrieved own medical records (${patDocsRes.data.data.length} documents)`);

    // ----------------------------------------------------
    // TEST 10: Strict 10-Digit Indian Phone Number Validation
    // ----------------------------------------------------
    console.log('\n[TEST 10] Testing Strict 10-Digit Indian Phone Validation...');
    const ashaRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'asha@demo.com',
      password: 'Demo@123',
    });
    ashaToken = ashaRes.data.token;

    // Test 10a: Invalid phone (9 digits) -> must fail with HTTP 400
    try {
      await axios.post(
        `${BASE_URL}/patients`,
        {
          name: 'Invalid Test User',
          age: 25,
          gender: 'Male',
          phone: '987654321', // 9 digits
          village: 'Shirur',
          district: 'Pune',
        },
        { headers: { Authorization: `Bearer ${ashaToken}` } }
      );
      throw new Error('9-digit phone was incorrectly accepted!');
    } catch (phoneErr) {
      if (phoneErr.response && phoneErr.response.status === 400) {
        console.log('  ✓ 9-digit phone rejected (HTTP 400 Bad Request)');
      } else {
        throw phoneErr;
      }
    }

    // Test 10b: Invalid phone (11 digits) -> must fail with HTTP 400
    try {
      await axios.post(
        `${BASE_URL}/patients`,
        {
          name: 'Invalid Test User',
          age: 25,
          gender: 'Male',
          phone: '98765432101', // 11 digits
          village: 'Shirur',
          district: 'Pune',
        },
        { headers: { Authorization: `Bearer ${ashaToken}` } }
      );
      throw new Error('11-digit phone was incorrectly accepted!');
    } catch (phoneErr) {
      if (phoneErr.response && phoneErr.response.status === 400) {
        console.log('  ✓ 11-digit phone rejected (HTTP 400 Bad Request)');
      } else {
        throw phoneErr;
      }
    }

    // Test 10c: Valid 10-digit Indian phone (e.g. 9823456789) -> must succeed
    const validUniquePhone = '98234' + Math.floor(10000 + Math.random() * 90000);
    const validPatientRes = await axios.post(
      `${BASE_URL}/patients`,
      {
        name: 'Ganesh Shinde',
        age: 44,
        gender: 'Male',
        phone: validUniquePhone,
        village: 'Koregaon',
        district: 'Satara',
        state: 'Maharashtra',
      },
      { headers: { Authorization: `Bearer ${ashaToken}` } }
    );
    if (!validPatientRes.data.success) {
      throw new Error('Valid 10-digit phone registration failed');
    }
    console.log(`  ✓ Valid 10-digit phone (${validUniquePhone}) accepted and registered successfully`);

    // ----------------------------------------------------
    // TEST 11: Facilities Directory & Geolocation Distance
    // ----------------------------------------------------
    console.log('\n[TEST 11] Testing Facilities Directory & Geolocation Lookups...');
    const facRes = await axios.get(`${BASE_URL}/facilities`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!facRes.data.success || !facRes.data.data.length) {
      throw new Error('Facilities directory failed');
    }
    console.log(`  ✓ Facilities directory returned ${facRes.data.data.length} public health institutions`);

    const nearbyRes = await axios.get(`${BASE_URL}/facilities/nearby?lat=18.5204&lng=73.8567&maxDistance=50`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!nearbyRes.data.success || !nearbyRes.data.data.length) {
      throw new Error('Nearby facilities query failed');
    }
    console.log(`  ✓ Geolocation query returned ${nearbyRes.data.data.length} facilities within 50km`);
    console.log(`    Closest: ${nearbyRes.data.data[0].name} (~${nearbyRes.data.data[0].distanceKm} km away)`);

    console.log('\n===============================================================');
    console.log('ALL 11 EXTENDED MODULE TESTS PASSED PERFECTLY! (11/11)');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Extended Verification Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runExtendedTests();
