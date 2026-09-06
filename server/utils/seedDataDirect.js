const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Consultation = require('../models/Consultation');
const Referral = require('../models/Referral');
const Followup = require('../models/Followup');

module.exports = async function seedInitialData() {
  try {
    const count = await User.countDocuments();
    if (count > 0) return;

    console.log('[AutoSeed] Seeding initial demo records...');

    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@123', salt);

    // 1. Create Demo Users
    const ashaWorker = await User.create({
      name: 'Sunita Devi (ASHA)',
      email: 'asha@demo.com',
      username: 'asha_demo',
      passwordHash: demoPasswordHash,
      role: 'ASHA',
      phone: '9876543210',
      language: 'en',
    });

    const doctor = await User.create({
      name: 'Dr. Ananya Sharma',
      email: 'doctor@demo.com',
      username: 'doctor_demo',
      passwordHash: demoPasswordHash,
      role: 'DOCTOR',
      phone: '9876543211',
      language: 'en',
    });

    // 2. Create Rahul Kumar
    const rahul = await Patient.create({
      patientId: 'SS-2026-0001',
      name: 'Rahul Kumar',
      age: 35,
      gender: 'Male',
      phone: '9876500001',
      address: 'House 42, North Para',
      village: 'Demo Village',
      district: 'Demo District',
      state: 'West Bengal',
      emergencyContact: '9876500002',
      bloodGroup: 'B+',
      allergies: ['Penicillin'],
      existingConditions: ['Mild Asthma'],
      currentRisk: 'YELLOW',
      riskNote: 'Suspected acute viral syndrome with secondary fatigue. Further clinical monitoring recommended.',
      riskAssessedBy: doctor._id,
      riskAssessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdBy: ashaWorker._id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    const rahulUser = await User.create({
      name: 'Rahul Kumar',
      email: 'patient@demo.com',
      username: 'patient0001',
      passwordHash: demoPasswordHash,
      role: 'PATIENT',
      patientId: rahul._id,
      phone: '9876500001',
      language: 'en',
    });

    rahul.userAccountId = rahulUser._id;
    await rahul.save();

    const rahulVisit = await Visit.create({
      patientId: rahul._id,
      recordedBy: ashaWorker._id,
      symptoms: [
        { name: 'Fever', duration: '3 days', severity: 'Moderate', notes: 'High temp in evenings' },
        { name: 'Body pain', duration: '2 days', severity: 'Moderate', notes: 'Generalized aches' },
      ],
      vitals: {
        temperature: 38.5,
        bloodPressure: { systolic: 128, diastolic: 82 },
        heartRate: 88,
        spO2: 97,
        respiratoryRate: 18,
        weight: 64,
      },
      suggestedRisk: 'YELLOW',
      suggestedRiskReasons: ['Elevated body temperature (38.5°C)', 'Clinical review recommended for symptom: Fever (Moderate)'],
      riskLevel: 'YELLOW',
      doctorRiskNote: 'Doctor confirmed YELLOW risk - Viral febrile episode with fatigue.',
      assessedBy: doctor._id,
      assessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Patient feels weak and feverish since Friday.',
      status: 'CONSULTED',
      visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await Consultation.create({
      patientId: rahul._id,
      doctorId: doctor._id,
      visitId: rahulVisit._id,
      observations: 'Mild pharyngeal erythema. Chest clear on auscultation. Vitals stable except 38.5°C fever.',
      assessment: 'Suspected acute viral syndrome with secondary fatigue.',
      advice: 'Adequate oral hydration (ORS, warm fluids), rest for 3 days.',
      treatmentInstructions: 'Tab Paracetamol 500mg TDS after food x 3 days. Cetirizine 10mg once at night x 3 days.',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Referral.create({
      patientId: rahul._id,
      doctorId: doctor._id,
      reason: 'Persistent fever requiring complete blood count & malaria/dengue profile tests',
      facility: 'District Hospital',
      department: 'General Medicine & Pathology',
      priority: 'ROUTINE',
      instructions: 'Fasting blood draw for CBC, Dengue NS1 & MP by card test.',
      status: 'COMPLETED',
      statusHistory: [
        { status: 'CREATED', updatedBy: doctor._id, note: 'Referral created', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'ACCEPTED', updatedBy: doctor._id, note: 'Accepted at District Hospital', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'PATIENT ARRIVED', updatedBy: ashaWorker._id, note: 'Patient arrived with ASHA escort', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'COMPLETED', updatedBy: doctor._id, note: 'Investigations completed. Routine viral confirmed.', updatedAt: new Date() },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Followup.create({
      patientId: rahul._id,
      doctorId: doctor._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      instructions: 'Check temperature chart and evaluate resolution of body pain.',
      status: 'PENDING',
      notes: 'Scheduled for 7-day post consultation review.',
    });

    // 3. Create Fatima Khatun (RED risk)
    const fatima = await Patient.create({
      patientId: 'SS-2026-0002',
      name: 'Fatima Khatun',
      age: 58,
      gender: 'Female',
      phone: '9876500003',
      address: 'Near Primary School',
      village: 'Rampur',
      district: 'Demo District',
      state: 'West Bengal',
      bloodGroup: 'O+',
      existingConditions: ['Type 2 Diabetes', 'Hypertension'],
      currentRisk: 'RED',
      riskNote: 'Critically low oxygen saturation (89%) and elevated BP (165/102). Urgent hospital transfer recommended.',
      riskAssessedBy: doctor._id,
      riskAssessedAt: new Date(),
      createdBy: ashaWorker._id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await Visit.create({
      patientId: fatima._id,
      recordedBy: ashaWorker._id,
      symptoms: [
        { name: 'Breathing difficulty', duration: '1 day', severity: 'Severe', notes: 'Shortness of breath on mild exertion' },
        { name: 'Chest discomfort', duration: '6 hours', severity: 'Moderate', notes: 'Substernal tightness' },
      ],
      vitals: {
        temperature: 37.1,
        bloodPressure: { systolic: 165, diastolic: 102 },
        heartRate: 112,
        spO2: 89,
        respiratoryRate: 26,
        weight: 68,
      },
      suggestedRisk: 'RED',
      suggestedRiskReasons: ['Critically low oxygen saturation (SpO2: 89%)', 'High risk red-flag symptom reported: Breathing difficulty (Severe)'],
      riskLevel: 'RED',
      doctorRiskNote: 'Confirmed RED - Severe respiratory distress and hypertensive crisis.',
      assessedBy: doctor._id,
      assessedAt: new Date(),
      notes: 'Patient visibly breathless. Advised immediate sitting posture and hospital transport.',
      status: 'REVIEWED',
      visitDate: new Date(),
    });

    // 4. Create Subir Das (GREEN)
    const subir = await Patient.create({
      patientId: 'SS-2026-0003',
      name: 'Subir Das',
      age: 28,
      gender: 'Male',
      phone: '9876500005',
      address: 'Station Road',
      village: 'Demo Village',
      district: 'Demo District',
      state: 'West Bengal',
      bloodGroup: 'A+',
      currentRisk: 'GREEN',
      riskNote: 'Normal physiological vitals recorded, routine seasonal care.',
      riskAssessedBy: doctor._id,
      riskAssessedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      createdBy: ashaWorker._id,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    await Visit.create({
      patientId: subir._id,
      recordedBy: ashaWorker._id,
      symptoms: [{ name: 'Cold', duration: '2 days', severity: 'Mild', notes: 'Runny nose' }],
      vitals: {
        temperature: 36.8,
        bloodPressure: { systolic: 118, diastolic: 76 },
        heartRate: 72,
        spO2: 99,
        respiratoryRate: 16,
        weight: 70,
      },
      suggestedRisk: 'GREEN',
      suggestedRiskReasons: ['Normal physiological vitals recorded', 'No high-risk emergency symptoms detected'],
      riskLevel: 'GREEN',
      notes: 'Routine seasonal checkup.',
      status: 'REVIEWED',
      visitDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    });

    await Followup.create({
      patientId: subir._id,
      doctorId: doctor._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      instructions: 'Check if cold symptoms subsided.',
      status: 'COMPLETED',
      notes: 'Patient reported full recovery.',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedBy: ashaWorker._id,
    });

    console.log('[AutoSeed] Completed auto-seeding successfully!');
  } catch (err) {
    console.error('[AutoSeed Failed]:', err);
  }
};
