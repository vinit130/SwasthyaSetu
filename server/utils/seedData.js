const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Consultation = require('../models/Consultation');
const Referral = require('../models/Referral');
const Followup = require('../models/Followup');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swasthyasetu';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Clear existing data
    await User.deleteMany();
    await Patient.deleteMany();
    await Visit.deleteMany();
    await Consultation.deleteMany();
    await Referral.deleteMany();
    await Followup.deleteMany();

    console.log('[Seed] Cleared existing records.');

    // Password hash for Demo@123
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@123', salt);

    // 1. Create Demo Users: ASHA & DOCTOR
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

    console.log('[Seed] Created demo users (ASHA & DOCTOR)');

    // 2. Create Patient: Rahul Kumar (Yellow Risk, full journey)
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

    // Create Demo Patient User for Rahul Kumar
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

    console.log('[Seed] Created demo patient user: patient@demo.com (username: patient0001)');

    // Rahul's Visit
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
      suggestedRiskReasons: [
        'Elevated body temperature (38.5°C)',
        'Clinical review recommended for symptom: Fever (Moderate)',
        'Clinical review recommended for symptom: Body pain (Moderate)',
      ],
      riskLevel: 'YELLOW',
      riskReasons: [
        'Elevated body temperature (38.5°C)',
        'Clinical review recommended for symptom: Fever (Moderate)',
        'Clinical review recommended for symptom: Body pain (Moderate)',
      ],
      doctorRiskNote: 'Doctor confirmed YELLOW risk - Viral febrile episode with fatigue.',
      assessedBy: doctor._id,
      assessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Patient feels weak and feverish since Friday.',
      status: 'CONSULTED',
      visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    // Rahul's Consultation
    const rahulConsultation = await Consultation.create({
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

    // Rahul's Referral (Completed lifecycle)
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
        { status: 'CREATED', updatedBy: doctor._id, note: 'Referral created by Dr. Ananya Sharma', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'ACCEPTED', updatedBy: doctor._id, note: 'Accepted at District Hospital Outpatient Unit', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'PATIENT ARRIVED', updatedBy: ashaWorker._id, note: 'Patient arrived with ASHA escort', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'COMPLETED', updatedBy: doctor._id, note: 'Pathology investigations completed. Routine viral confirmed.', updatedAt: new Date() },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Rahul's Follow-up
    await Followup.create({
      patientId: rahul._id,
      doctorId: doctor._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      instructions: 'Check temperature chart and evaluate resolution of body pain.',
      status: 'PENDING',
      notes: 'Scheduled for 7-day post consultation review.',
    });

    // 3. Create Patient: Fatima Khatun (RED risk, urgent awaiting review)
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
      suggestedRiskReasons: [
        'Critically low oxygen saturation (SpO2: 89%)',
        'Critically elevated blood pressure (165/102 mmHg)',
        'High risk red-flag symptom reported: Breathing difficulty (Severe)',
        'High risk red-flag symptom reported: Chest discomfort (Moderate)',
      ],
      riskLevel: 'RED',
      doctorRiskNote: 'Confirmed RED - Severe respiratory distress and hypertensive crisis.',
      assessedBy: doctor._id,
      assessedAt: new Date(),
      notes: 'Patient visibly breathless. Advised immediate sitting posture and hospital transport.',
      status: 'REVIEWED',
      visitDate: new Date(),
    });

    // 4. Create Patient: Subir Das (GREEN routine monitoring)
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
      symptoms: [
        { name: 'Cold', duration: '2 days', severity: 'Mild', notes: 'Runny nose' },
      ],
      vitals: {
        temperature: 36.8,
        bloodPressure: { systolic: 118, diastolic: 76 },
        heartRate: 72,
        spO2: 99,
        respiratoryRate: 16,
        weight: 70,
      },
      suggestedRisk: 'GREEN',
      suggestedRiskReasons: [
        'Normal physiological vitals recorded',
        'No high-risk emergency symptoms detected',
      ],
      riskLevel: 'GREEN',
      notes: 'Routine seasonal checkup.',
      status: 'REVIEWED',
      visitDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    });

    // Subir has a completed follow-up
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

    // 5. Create Patient: Priya Roy (Pending referral)
    const priya = await Patient.create({
      patientId: 'SS-2026-0004',
      name: 'Priya Roy',
      age: 24,
      gender: 'Female',
      phone: '9876500007',
      address: 'South Gram',
      village: 'Demo Village',
      district: 'Demo District',
      state: 'West Bengal',
      bloodGroup: 'AB+',
      currentRisk: 'YELLOW',
      riskNote: 'High risk pregnancy screening required at Sub-Divisional Hospital.',
      riskAssessedBy: doctor._id,
      riskAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdBy: ashaWorker._id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Referral.create({
      patientId: priya._id,
      doctorId: doctor._id,
      reason: 'Antenatal ultrasound scanning and high-risk pregnancy screening',
      facility: 'Sub-Divisional Hospital',
      department: 'Obstetrics & Gynecology',
      priority: 'URGENT',
      instructions: 'Second trimester anomaly scan + hemoglobin check.',
      status: 'ACCEPTED',
      statusHistory: [
        { status: 'CREATED', updatedBy: doctor._id, note: 'Referral created by Dr. Ananya Sharma', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'ACCEPTED', updatedBy: doctor._id, note: 'Appointment slot allocated for Thursday', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });

    console.log('[Seed] Database successfully seeded with 3-role demo data and doctor-confirmed risk!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
