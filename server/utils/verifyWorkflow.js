/**
 * SwasthyaSetu 3-Role Architecture & Continuum of Care Verification Suite
 *
 * Verifies:
 * 1. Authentication for all 3 roles: ASHA, DOCTOR, PATIENT (both email and username)
 * 2. Patient Registration with Auto-Generated Credentials & Duplicate Prevention
 * 3. Login using newly generated Patient credentials
 * 4. Patient Isolation & Access Control (Privacy protection: 403 on cross-patient access)
 * 5. Frontline Screening & Decision Support (Rule-based suggested risk)
 * 6. Doctor-Confirmed Risk (Single Source of Truth: POST /api/patients/:id/risk-assessment)
 * 7. Multi-Dashboard Risk Consistency (ASHA, Doctor, Patient see confirmed risk)
 * 8. Strict Referral Lifecycle State Machine (CREATED -> ACCEPTED -> PATIENT ARRIVED -> COMPLETED)
 *    and rejection of invalid transitions
 * 9. Follow-up Lifecycle (Doctor schedules -> ASHA completes with visit notes)
 * 10. Role-Based Security Enforcement across all 3 roles
 */

const axios = require('axios');
require('../server');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log('\n===============================================================');
  console.log('SWASTHYASETU 3-ROLE ARCHITECTURE & WORKFLOW VERIFICATION SUITE');
  console.log('===============================================================\n');

  let ashaToken = '';
  let doctorToken = '';
  let demoPatientToken = '';
  let newPatientToken = '';
  let testPatientId = '';
  let testVisitId = '';
  let testReferralId = '';
  let testFollowupId = '';
  let generatedCreds = null;

  try {
    // ----------------------------------------------------
    // TEST 1: 3-Role Authentication & Username Login
    // ----------------------------------------------------
    console.log('[TEST 1] Testing 3-Role Authentication...');

    // 1a: ASHA Login
    const ashaRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'asha@demo.com',
      password: 'Demo@123',
    });
    if (ashaRes.data.success && ashaRes.data.user.role === 'ASHA') {
      ashaToken = ashaRes.data.token;
      console.log('  ✓ 1a. ASHA Login successful (Role: ASHA)');
    } else {
      throw new Error('ASHA login failed');
    }

    // 1b: Doctor Login
    const docRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'doctor@demo.com',
      password: 'Demo@123',
    });
    if (docRes.data.success && docRes.data.user.role === 'DOCTOR') {
      doctorToken = docRes.data.token;
      console.log('  ✓ 1b. Doctor Login successful (Role: DOCTOR)');
    } else {
      throw new Error('Doctor login failed');
    }

    // 1c: Patient Login via Email
    const patientEmailRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'patient@demo.com',
      password: 'Demo@123',
    });
    if (patientEmailRes.data.success && patientEmailRes.data.user.role === 'PATIENT') {
      demoPatientToken = patientEmailRes.data.token;
      console.log('  ✓ 1c. Patient Login via Email successful (Role: PATIENT, PatientId: ' + patientEmailRes.data.user.patientId + ')');
    } else {
      throw new Error('Patient email login failed');
    }

    // 1d: Patient Login via Username
    const patientUsernameRes = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'patient0001',
      password: 'Demo@123',
    });
    if (patientUsernameRes.data.success && patientUsernameRes.data.user.role === 'PATIENT') {
      console.log('  ✓ 1d. Patient Login via Username (patient0001) successful');
    } else {
      throw new Error('Patient username login failed');
    }

    const ashaHeaders = { Authorization: `Bearer ${ashaToken}` };
    const docHeaders = { Authorization: `Bearer ${doctorToken}` };
    const demoPatientHeaders = { Authorization: `Bearer ${demoPatientToken}` };

    // ----------------------------------------------------
    // TEST 2: Patient Registration & Auto-Credential Generation
    // ----------------------------------------------------
    console.log('\n[TEST 2] Testing Patient Registration & Auto-Credential Creation...');

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const uniquePhone = '98765' + randomSuffix;
    const newPatientPayload = {
      name: 'Pooja Mondal',
      age: 38,
      gender: 'Female',
      phone: uniquePhone,
      address: 'House 14, Ward 2',
      village: 'Demo Village',
      district: 'Demo District',
      state: 'West Bengal',
      bloodGroup: 'B+',
      allergies: ['Dust'],
      existingConditions: ['Mild Asthma'],
    };

    const regRes = await axios.post(`${BASE_URL}/patients`, newPatientPayload, { headers: ashaHeaders });
    if (regRes.data.success && regRes.data.userCredentials) {
      testPatientId = regRes.data.data._id;
      generatedCreds = regRes.data.userCredentials;
      console.log(`  ✓ Patient registered: ${regRes.data.data.name} (ID: ${regRes.data.data.patientId})`);
      console.log(`  ✓ Auto-generated Patient Credentials: Username=${generatedCreds.username}, TempPassword=${generatedCreds.temporaryPassword}`);
    } else {
      throw new Error('Patient registration failed to return user credentials');
    }

    // Duplicate registration detection test
    try {
      await axios.post(`${BASE_URL}/patients`, newPatientPayload, { headers: ashaHeaders });
      throw new Error('Duplicate patient was incorrectly allowed');
    } catch (dupErr) {
      if (dupErr.response && dupErr.response.status === 409) {
        console.log('  ✓ Duplicate prevention verified: Accidental re-registration blocked (HTTP 409 Conflict)');
      } else {
        throw dupErr;
      }
    }

    // ----------------------------------------------------
    // TEST 3: Login with Newly Generated Patient Credentials
    // ----------------------------------------------------
    console.log('\n[TEST 3] Testing Login with Newly Generated Patient Account...');

    const newPatientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: generatedCreds.username,
      password: generatedCreds.temporaryPassword,
    });
    if (newPatientLogin.data.success && newPatientLogin.data.user.role === 'PATIENT') {
      newPatientToken = newPatientLogin.data.token;
      console.log(`  ✓ Successfully signed in as newly registered patient (${generatedCreds.username})`);
    } else {
      throw new Error('Login with generated patient credentials failed');
    }

    const newPatientHeaders = { Authorization: `Bearer ${newPatientToken}` };

    // ----------------------------------------------------
    // TEST 4: Patient Isolation & Security (Cross-Patient Access Blocked)
    // ----------------------------------------------------
    console.log('\n[TEST 4] Testing Patient Isolation & Privacy Enforcement...');

    // Patient attempts to access another patient's profile directly
    try {
      await axios.get(`${BASE_URL}/patients/${testPatientId}`, { headers: demoPatientHeaders });
      throw new Error('Security violation: Patient was able to access another patient record!');
    } catch (isoErr) {
      if (isoErr.response && isoErr.response.status === 403) {
        console.log('  ✓ Patient Isolation Verified: Cross-patient record access denied (HTTP 403 Forbidden)');
      } else {
        throw isoErr;
      }
    }

    // Patient accesses own journey endpoint
    const ownJourneyRes = await axios.get(`${BASE_URL}/patients/me/journey`, { headers: newPatientHeaders });
    if (ownJourneyRes.data.success && ownJourneyRes.data.data.patient._id.toString() === testPatientId) {
      console.log(`  ✓ Patient successfully retrieved own care journey (ID: ${ownJourneyRes.data.data.patient.patientId})`);
    } else {
      throw new Error('Patient me/journey did not return matching own patient profile');
    }

    // ----------------------------------------------------
    // TEST 5: Frontline Screening (Advisory Suggested Risk)
    // ----------------------------------------------------
    console.log('\n[TEST 5] Testing Frontline Screening & Advisory Risk Engine...');

    const visitRes = await axios.post(
      `${BASE_URL}/patients/${testPatientId}/visits`,
      {
        symptoms: [
          { name: 'Persistent Cough', duration: '5 days', severity: 'Moderate' },
          { name: 'Chest tightness', duration: '2 days', severity: 'Moderate' },
        ],
        vitals: {
          temperature: 38.2,
          bloodPressure: { systolic: 142, diastolic: 92 },
          spO2: 94,
          heartRate: 102,
          respiratoryRate: 22,
          weight: 58,
        },
        notes: 'Frontline visit recorded by ASHA worker',
      },
      { headers: ashaHeaders }
    );

    if (visitRes.data.success) {
      testVisitId = visitRes.data.data._id;
      console.log(`  ✓ Frontline Visit recorded.`);
      console.log(`    Suggested Risk (Rule Engine): ${visitRes.data.data.suggestedRisk}`);
      console.log(`    Visit Risk Status: ${visitRes.data.data.riskLevel} (Awaiting Doctor Review)`);
    }

    // ----------------------------------------------------
    // TEST 6: Doctor-Confirmed Risk (Single Source of Truth)
    // ----------------------------------------------------
    console.log('\n[TEST 6] Testing Doctor-Confirmed Risk Assessment (Single Source of Truth)...');

    const assessRes = await axios.post(
      `${BASE_URL}/patients/${testPatientId}/risk-assessment`,
      {
        riskLevel: 'YELLOW',
        reason: 'Moderate acute bronchitis with mild wheeze. Vitals stable; start bronchodilator & monitor.',
        visitId: testVisitId,
      },
      { headers: docHeaders }
    );

    if (assessRes.data.success && assessRes.data.data.patient.currentRisk === 'YELLOW') {
      console.log('  ✓ Doctor confirmed risk: YELLOW (Further Attention)');
      console.log(`    Clinical Note: "${assessRes.data.data.patient.riskNote}"`);
      console.log(`    Assessed By: Dr. ${assessRes.data.data.patient.riskAssessedBy.name}`);
    } else {
      throw new Error('Doctor risk assessment failed');
    }

    // ----------------------------------------------------
    // TEST 7: Multi-Dashboard Risk Consistency
    // ----------------------------------------------------
    console.log('\n[TEST 7] Testing Multi-Dashboard Risk Consistency across all 3 roles...');

    // ASHA View
    const ashaPatientRes = await axios.get(`${BASE_URL}/patients/${testPatientId}`, { headers: ashaHeaders });
    const ashaViewRisk = ashaPatientRes.data.data.patient.currentRisk;

    // Doctor View
    const docPatientRes = await axios.get(`${BASE_URL}/patients/${testPatientId}`, { headers: docHeaders });
    const docViewRisk = docPatientRes.data.data.patient.currentRisk;

    // Patient View
    const patJourneyRes = await axios.get(`${BASE_URL}/patients/me/journey`, { headers: newPatientHeaders });
    const patViewRisk = patJourneyRes.data.data.patient.currentRisk;

    if (ashaViewRisk === 'YELLOW' && docViewRisk === 'YELLOW' && patViewRisk === 'YELLOW') {
      console.log('  ✓ Perfect Multi-Dashboard Consistency: All 3 roles display confirmed risk YELLOW');
    } else {
      throw new Error(`Risk mismatch across dashboards: ASHA=${ashaViewRisk}, Doctor=${docViewRisk}, Patient=${patViewRisk}`);
    }

    // ----------------------------------------------------
    // TEST 8: Sequential Referral State Machine & Transition Validation
    // ----------------------------------------------------
    console.log('\n[TEST 8] Testing Referral Sequential Lifecycle & State Machine...');

    // 1. Doctor creates referral
    const refRes = await axios.post(
      `${BASE_URL}/referrals`,
      {
        patientId: testPatientId,
        facility: 'Sub-Divisional Hospital',
        department: 'Chest & Respiratory Medicine',
        priority: 'URGENT',
        reason: 'Bronchial evaluation and chest X-ray',
        instructions: 'Accompanied by ASHA worker with vitals chart',
      },
      { headers: docHeaders }
    );

    if (refRes.data.success) {
      testReferralId = refRes.data.data._id;
      console.log(`  ✓ Stage 1: CREATED (${refRes.data.data.facility})`);
    }

    // 2. Attempt invalid jump from CREATED directly to COMPLETED (Must fail with HTTP 400)
    try {
      await axios.put(
        `${BASE_URL}/referrals/${testReferralId}/status`,
        { status: 'COMPLETED', note: 'Attempting illegal transition jump' },
        { headers: docHeaders }
      );
      throw new Error('State machine failed: illegal skip from CREATED directly to COMPLETED was allowed');
    } catch (transErr) {
      if (transErr.response && transErr.response.status === 400) {
        console.log('  ✓ State machine enforcement verified: Invalid transition CREATED -> COMPLETED rejected (HTTP 400)');
      } else {
        throw transErr;
      }
    }

    // 3. Valid Step 2: ACCEPTED
    const refAcc = await axios.put(
      `${BASE_URL}/referrals/${testReferralId}/status`,
      { status: 'ACCEPTED', note: 'Bed & clinic slot reserved at Chest department' },
      { headers: docHeaders }
    );
    console.log(`  ✓ Stage 2: ${refAcc.data.data.status}`);

    // 4. Valid Step 3: PATIENT ARRIVED
    const refArr = await axios.put(
      `${BASE_URL}/referrals/${testReferralId}/status`,
      { status: 'PATIENT ARRIVED', note: 'Patient reached hospital accompanied by ASHA' },
      { headers: ashaHeaders }
    );
    console.log(`  ✓ Stage 3: ${refArr.data.data.status}`);

    // 5. Valid Step 4: COMPLETED
    const refComp = await axios.put(
      `${BASE_URL}/referrals/${testReferralId}/status`,
      { status: 'COMPLETED', note: 'X-ray completed. Nebulization therapy administered.' },
      { headers: docHeaders }
    );
    console.log(`  ✓ Stage 4: ${refComp.data.data.status}`);

    // ----------------------------------------------------
    // TEST 9: Follow-up Lifecycle
    // ----------------------------------------------------
    console.log('\n[TEST 9] Testing Care Follow-up Lifecycle...');

    const targetFollowDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const followRes = await axios.post(
      `${BASE_URL}/followups`,
      {
        patientId: testPatientId,
        date: targetFollowDate,
        dueDate: targetFollowDate,
        instructions: 'Check pulse oximetry and respiratory rate at household.',
        notes: 'Post-referral recovery check',
      },
      { headers: docHeaders }
    );

    if (followRes.data.success) {
      testFollowupId = followRes.data.data._id;
      const displayDate = followRes.data.data.date || followRes.data.data.dueDate;
      console.log(`  ✓ Follow-up scheduled by Doctor for ${new Date(displayDate).toLocaleDateString()}`);
    }

    // ASHA completes the follow-up
    const followComp = await axios.put(
      `${BASE_URL}/followups/${testFollowupId}`,
      {
        status: 'COMPLETED',
        notes: 'Home visit conducted. Patient breathing freely, SpO2 98%, no fever.',
      },
      { headers: ashaHeaders }
    );
    if (followComp.data.success && followComp.data.data.status === 'COMPLETED') {
      console.log('  ✓ ASHA worker completed follow-up with home visit clinical note');
    }

    // ----------------------------------------------------
    // TEST 10: Security, Role Restrictions & Disclaimer Verification
    // ----------------------------------------------------
    console.log('\n[TEST 10] Testing Security, Role Guards & Access Restrictions...');

    // Patient attempting to create a visit (Must fail with 403)
    try {
      await axios.post(
        `${BASE_URL}/patients/${testPatientId}/visits`,
        { symptoms: [], vitals: {} },
        { headers: newPatientHeaders }
      );
      throw new Error('Security violation: Patient was able to create a clinical visit!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('  ✓ Role security verified: Patient blocked from Staff Screening endpoint (HTTP 403 Forbidden)');
      } else {
        throw err;
      }
    }

    // ASHA attempting to assess risk (Must fail with 403)
    try {
      await axios.post(
        `${BASE_URL}/patients/${testPatientId}/risk-assessment`,
        { riskLevel: 'GREEN', reason: 'Attempt by ASHA' },
        { headers: ashaHeaders }
      );
      throw new Error('Security violation: ASHA was able to call doctor risk assessment!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('  ✓ Role security verified: ASHA blocked from Doctor Risk Assessment endpoint (HTTP 403 Forbidden)');
      } else {
        throw err;
      }
    }

    // Unauthenticated request to protected route (Must fail with 401)
    try {
      await axios.get(`${BASE_URL}/patients`);
      throw new Error('Security violation: Unauthenticated access was allowed!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('  ✓ Auth security verified: Unauthenticated request rejected (HTTP 401 Unauthorized)');
      } else {
        throw err;
      }
    }

    console.log('\n===============================================================');
    console.log('ALL 10 ARCHITECTURAL & WORKFLOW TESTS PASSED PERFECTLY! (10/10)');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Verification Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

runTests();
