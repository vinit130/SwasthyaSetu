const bcrypt = require('bcryptjs');
const { assessRisk } = require('./riskEngine');
const { validateIndianPhone, generateReferralToken } = require('./validators');
const { MAHARASHTRA_FACILITIES } = require('./facilityProvider');

// Demo User IDs
const ASHA_ID = '66d000000000000000000001';
const DOCTOR_ID = '66d000000000000000000002';
const PATIENT_USER_ID = '66d000000000000000000003';
const HEALTH_ADMIN_ID = '66d000000000000000000004';
const HOSPITAL_USER_ID = '66d000000000000000000005';

// Demo Patient IDs
const RAHUL_ID = '66d000000000000000000011';
const FATIMA_ID = '66d000000000000000000012';
const SUBIR_ID = '66d000000000000000000013';

class MockStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = [
      {
        _id: ASHA_ID,
        id: ASHA_ID,
        name: 'Sunita Devi (ASHA)',
        email: 'asha@demo.com',
        username: 'asha_demo',
        role: 'ASHA',
        phone: '9876543210',
        assignedDistrict: 'Pune',
        assignedBlock: 'Shirur',
        language: 'en',
      },
      {
        _id: DOCTOR_ID,
        id: DOCTOR_ID,
        name: 'Dr. Ananya Sharma',
        email: 'doctor@demo.com',
        username: 'doctor_demo',
        role: 'DOCTOR',
        phone: '9876543211',
        facilityId: 'fac_shirur_phc',
        facilityName: 'Primary Health Centre (PHC), Shirur Rural',
        assignedDistrict: 'Pune',
        language: 'en',
      },
      {
        _id: PATIENT_USER_ID,
        id: PATIENT_USER_ID,
        name: 'Rahul Kumar',
        email: 'patient@demo.com',
        username: 'patient0001',
        role: 'PATIENT',
        patientId: RAHUL_ID,
        phone: '9876500001',
        language: 'en',
      },
      {
        _id: HEALTH_ADMIN_ID,
        id: HEALTH_ADMIN_ID,
        name: 'Dr. Rajesh Shinde (Director of Health Services)',
        email: 'admin@demo.com',
        username: 'admin_demo',
        role: 'HEALTH_DEPARTMENT_ADMIN',
        phone: '9876543212',
        assignedDistrict: 'All Maharashtra',
        language: 'en',
      },
      {
        _id: HOSPITAL_USER_ID,
        id: HOSPITAL_USER_ID,
        name: 'Dr. Suresh Patil (Medical Superintendent)',
        email: 'hospital@demo.com',
        username: 'hospital_demo',
        role: 'DISTRICT_HOSPITAL',
        phone: '9876543213',
        facilityId: 'fac_pune_dh',
        facilityName: 'District Hospital, Aundh, Pune',
        assignedDistrict: 'Pune',
        language: 'en',
      },
    ];

    this.facilities = [...MAHARASHTRA_FACILITIES];

    this.patients = [
      {
        _id: RAHUL_ID,
        id: RAHUL_ID,
        patientId: 'SS-2026-0001',
        name: 'Rahul Kumar',
        age: 35,
        gender: 'Male',
        phone: '9876500001',
        address: 'House 42, Shirur Rural',
        village: 'Shirur',
        district: 'Pune',
        state: 'Maharashtra',
        emergencyContact: '9876500002',
        bloodGroup: 'B+',
        allergies: ['Penicillin'],
        existingConditions: ['Mild Asthma'],
        currentRisk: 'YELLOW',
        riskNote: 'Suspected acute viral febrile syndrome with secondary fatigue. Further clinical monitoring recommended.',
        riskAssessedBy: { _id: DOCTOR_ID, id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        riskAssessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { _id: ASHA_ID, id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: FATIMA_ID,
        id: FATIMA_ID,
        patientId: 'SS-2026-0002',
        name: 'Fatima Khatun',
        age: 58,
        gender: 'Female',
        phone: '9876500003',
        address: 'Near Gram Panchayat',
        village: 'Saswad',
        district: 'Pune',
        state: 'Maharashtra',
        bloodGroup: 'O+',
        allergies: [],
        existingConditions: ['Type 2 Diabetes', 'Hypertension'],
        currentRisk: 'RED',
        riskNote: 'Critically low oxygen saturation (89%) and elevated BP (165/102). Urgent hospital transfer recommended.',
        riskAssessedBy: { _id: DOCTOR_ID, id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        riskAssessedAt: new Date().toISOString(),
        createdBy: { _id: ASHA_ID, id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: SUBIR_ID,
        id: SUBIR_ID,
        patientId: 'SS-2026-0003',
        name: 'Subir Das',
        age: 28,
        gender: 'Male',
        phone: '9876500005',
        address: 'Station Road',
        village: 'Koregaon',
        district: 'Satara',
        state: 'Maharashtra',
        bloodGroup: 'A+',
        allergies: [],
        existingConditions: [],
        currentRisk: 'GREEN',
        riskNote: 'Normal physiological vitals recorded, routine seasonal care.',
        riskAssessedBy: { _id: DOCTOR_ID, id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        riskAssessedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: { _id: ASHA_ID, id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.visits = [
      {
        _id: '66d000000000000000000021',
        patientId: RAHUL_ID,
        recordedBy: { _id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
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
        assessedBy: { _id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        assessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Patient feels weak and feverish since Friday.',
        status: 'CONSULTED',
        visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '66d000000000000000000022',
        patientId: FATIMA_ID,
        recordedBy: { _id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
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
        assessedBy: { _id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        assessedAt: new Date().toISOString(),
        notes: 'Patient visibly breathless. Advised immediate sitting posture and hospital transport.',
        status: 'REVIEWED',
        visitDate: new Date().toISOString(),
      },
      {
        _id: '66d000000000000000000023',
        patientId: SUBIR_ID,
        recordedBy: { _id: ASHA_ID, name: 'Sunita Devi (ASHA)', role: 'ASHA' },
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
        visitDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.consultations = [
      {
        _id: '66d000000000000000000031',
        patientId: RAHUL_ID,
        doctorId: { _id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        visitId: '66d000000000000000000021',
        observations: 'Mild pharyngeal erythema. Chest clear on auscultation. Vitals stable except 38.5°C fever.',
        assessment: 'Suspected acute viral syndrome with secondary fatigue.',
        advice: 'Adequate oral hydration (ORS, warm fluids), rest for 3 days.',
        treatmentInstructions: 'Tab Paracetamol 500mg TDS after food x 3 days. Cetirizine 10mg once at night x 3 days.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.referrals = [
      {
        _id: '66d000000000000000000041',
        referralToken: 'SS-REF-2026-8X4K29',
        patientId: {
          _id: RAHUL_ID,
          patientId: 'SS-2026-0001',
          name: 'Rahul Kumar',
          phone: '9876500001',
          age: 35,
          gender: 'Male',
          village: 'Shirur',
          district: 'Pune',
        },
        doctorId: {
          _id: DOCTOR_ID,
          name: 'Dr. Ananya Sharma',
          role: 'DOCTOR',
          phone: '9876543211',
        },
        reason: 'Persistent fever requiring complete blood count & malaria/dengue profile tests',
        facility: 'District Hospital, Aundh, Pune',
        hospitalId: 'fac_pune_dh',
        department: 'General Medicine & Pathology',
        priority: 'ROUTINE',
        instructions: 'Fasting blood draw for CBC, Dengue NS1 & MP by card test.',
        status: 'COMPLETED',
        bedNumber: 'GEN-M-12',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dischargeDate: new Date().toISOString(),
        treatmentSummary: 'Completed 48h observation. IV fluids administered. CBC normal, Dengue NS1 negative. Discharged stable.',
        statusHistory: [
          { status: 'CREATED', updatedBy: { name: 'Dr. Ananya Sharma', role: 'DOCTOR' }, note: 'Referral initiated by doctor', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'ACCEPTED', updatedBy: { name: 'Dr. Suresh Patil', role: 'DISTRICT_HOSPITAL' }, note: 'Referral accepted at District Hospital Pune', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'PATIENT ARRIVED', updatedBy: { name: 'Sunita Devi (ASHA)', role: 'ASHA' }, note: 'Patient arrived with ASHA escort at OPD', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'COMPLETED', updatedBy: { name: 'Dr. Suresh Patil', role: 'DISTRICT_HOSPITAL' }, note: 'Investigations completed. Routine viral confirmed. Discharged.', updatedAt: new Date().toISOString() },
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    this.followups = [
      {
        _id: '66d000000000000000000051',
        patientId: {
          _id: RAHUL_ID,
          patientId: 'SS-2026-0001',
          name: 'Rahul Kumar',
          phone: '9876500001',
          age: 35,
          gender: 'Male',
          village: 'Shirur',
          district: 'Pune',
        },
        doctorId: {
          _id: DOCTOR_ID,
          name: 'Dr. Ananya Sharma',
          role: 'DOCTOR',
        },
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Check temperature chart and evaluate resolution of body pain.',
        status: 'PENDING',
        notes: 'Scheduled for 7-day post consultation review.',
      },
      {
        _id: '66d000000000000000000052',
        patientId: {
          _id: SUBIR_ID,
          patientId: 'SS-2026-0003',
          name: 'Subir Das',
          phone: '9876500005',
          age: 28,
          gender: 'Male',
          village: 'Koregaon',
          district: 'Satara',
        },
        doctorId: {
          _id: DOCTOR_ID,
          name: 'Dr. Ananya Sharma',
          role: 'DOCTOR',
        },
        completedBy: {
          _id: ASHA_ID,
          name: 'Sunita Devi (ASHA)',
          role: 'ASHA',
        },
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        instructions: 'Check if cold symptoms subsided.',
        status: 'COMPLETED',
        notes: 'Patient reported full recovery.',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Hospital Ward Beds
    this.beds = [
      { _id: 'bed_1', facilityId: 'fac_pune_dh', ward: 'ICU', bedNumber: 'ICU-01', status: 'AVAILABLE', patientId: null, patientName: '' },
      { _id: 'bed_2', facilityId: 'fac_pune_dh', ward: 'ICU', bedNumber: 'ICU-02', status: 'OCCUPIED', patientId: FATIMA_ID, patientName: 'Fatima Khatun', admissionDate: new Date().toISOString() },
      { _id: 'bed_3', facilityId: 'fac_pune_dh', ward: 'GENERAL_MALE', bedNumber: 'GEN-M-01', status: 'AVAILABLE', patientId: null, patientName: '' },
      { _id: 'bed_4', facilityId: 'fac_pune_dh', ward: 'GENERAL_MALE', bedNumber: 'GEN-M-02', status: 'AVAILABLE', patientId: null, patientName: '' },
      { _id: 'bed_5', facilityId: 'fac_pune_dh', ward: 'GENERAL_MALE', bedNumber: 'GEN-M-12', status: 'AVAILABLE', patientId: null, patientName: '' },
      { _id: 'bed_6', facilityId: 'fac_pune_dh', ward: 'GENERAL_FEMALE', bedNumber: 'GEN-F-01', status: 'AVAILABLE', patientId: null, patientName: '' },
      { _id: 'bed_7', facilityId: 'fac_pune_dh', ward: 'MATERNITY', bedNumber: 'MAT-01', status: 'OCCUPIED', patientId: null, patientName: 'Geeta Shinde', admissionDate: new Date().toISOString() },
      { _id: 'bed_8', facilityId: 'fac_pune_dh', ward: 'EMERGENCY', bedNumber: 'EMG-01', status: 'AVAILABLE', patientId: null, patientName: '' },
    ];

    // Hospital Encounters (Treatments & Emergencies)
    this.hospitalEncounters = [
      {
        _id: 'enc_001',
        patientId: RAHUL_ID,
        facilityId: 'fac_pune_dh',
        hospitalName: 'District Hospital, Aundh, Pune',
        referralId: '66d000000000000000000041',
        encounterType: 'REFERRAL_ADMISSION',
        attendingDoctor: 'Dr. Suresh Patil (Medical Supt.)',
        ward: 'GENERAL_MALE',
        bedNumber: 'GEN-M-12',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dischargeDate: new Date().toISOString(),
        diagnosis: 'Acute Viral Febrile Episode with Moderate Dehydration',
        procedures: ['Peripheral IV Cannulation', 'IV Fluid Resuscitation (RL 1000ml)', 'Continuous Vital Monitoring'],
        medicinesPrescribed: ['Tab Paracetamol 650mg TDS', 'IV Pantoprazole 40mg OD', 'Oral Rehydration Salts (ORS)'],
        treatmentNotes: 'Patient responded well to IV hydration and antipyretics. Temperature settled to 37.0°C. Discharge granted.',
        dischargeInstructions: 'Continue rest for 3 days. Complete prescribed oral course. Return if high fever recurs.',
        status: 'DISCHARGED',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Medical Inventory
    this.inventory = [
      {
        _id: 'inv_001',
        facilityId: 'fac_pune_dh',
        facilityName: 'District Hospital, Aundh, Pune',
        district: 'Pune',
        itemName: 'Paracetamol 500mg Tablets',
        category: 'MEDICINE',
        unit: 'strips',
        quantityAvailable: 450,
        minimumStockLevel: 100,
        maximumStockLevel: 1000,
        batchNumber: 'PCM-2026-09',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'IN_STOCK',
        lastUpdatedBy: HOSPITAL_USER_ID,
      },
      {
        _id: 'inv_002',
        facilityId: 'fac_pune_dh',
        facilityName: 'District Hospital, Aundh, Pune',
        district: 'Pune',
        itemName: 'Normal Saline 0.9% IV Infusion (500ml)',
        category: 'IV_FLUID',
        unit: 'bottles',
        quantityAvailable: 25,
        minimumStockLevel: 50,
        maximumStockLevel: 300,
        batchNumber: 'NS-2025-11',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'LOW_STOCK',
        lastUpdatedBy: HOSPITAL_USER_ID,
      },
      {
        _id: 'inv_003',
        facilityId: 'fac_pune_dh',
        facilityName: 'District Hospital, Aundh, Pune',
        district: 'Pune',
        itemName: 'Inj. Ceftriaxone 1g',
        category: 'INJECTION',
        unit: 'vials',
        quantityAvailable: 0,
        minimumStockLevel: 30,
        maximumStockLevel: 200,
        batchNumber: 'CTX-2025-04',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'OUT_OF_STOCK',
        lastUpdatedBy: HOSPITAL_USER_ID,
      },
      {
        _id: 'inv_004',
        facilityId: 'fac_pune_dh',
        facilityName: 'District Hospital, Aundh, Pune',
        district: 'Pune',
        itemName: 'Sterile Surgical Gloves (Size 7.5)',
        category: 'SURGICAL',
        unit: 'pairs',
        quantityAvailable: 18,
        minimumStockLevel: 40,
        maximumStockLevel: 250,
        batchNumber: 'GLV-2026-01',
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'EXPIRING_SOON',
        lastUpdatedBy: HOSPITAL_USER_ID,
      },
      {
        _id: 'inv_005',
        facilityId: 'fac_shirur_phc',
        facilityName: 'Primary Health Centre (PHC), Shirur Rural',
        district: 'Pune',
        itemName: 'Oral Rehydration Salts (ORS) Sachets',
        category: 'MEDICINE',
        unit: 'sachets',
        quantityAvailable: 120,
        minimumStockLevel: 30,
        maximumStockLevel: 300,
        batchNumber: 'ORS-2026-08',
        expiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'IN_STOCK',
        lastUpdatedBy: DOCTOR_ID,
      },
    ];

    // Inventory Movements
    this.inventoryMovements = [
      {
        _id: 'mov_001',
        inventoryItemId: 'inv_001',
        facilityId: 'fac_pune_dh',
        type: 'ADD',
        quantityChanged: 500,
        previousQuantity: 0,
        newQuantity: 500,
        reason: 'Monthly state central medical store receipt',
        performedBy: { name: 'Dr. Suresh Patil', role: 'DISTRICT_HOSPITAL' },
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'mov_002',
        inventoryItemId: 'inv_001',
        facilityId: 'fac_pune_dh',
        type: 'DISPENSE',
        quantityChanged: -50,
        previousQuantity: 500,
        newQuantity: 450,
        reason: 'OPD and Emergency Ward replenishment',
        performedBy: { name: 'Dr. Suresh Patil', role: 'DISTRICT_HOSPITAL' },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Medical Documents (Prescriptions, Lab reports, Discharge summaries)
    this.medicalDocuments = [
      {
        _id: 'doc_001',
        patientId: RAHUL_ID,
        uploadedBy: { _id: HOSPITAL_USER_ID, name: 'Dr. Suresh Patil', role: 'DISTRICT_HOSPITAL' },
        uploaderRole: 'DISTRICT_HOSPITAL',
        facilityName: 'District Hospital, Aundh, Pune',
        documentType: 'DISCHARGE_SUMMARY',
        title: 'Inpatient Discharge Summary & Lab Investigation',
        fileName: 'Discharge_Summary_Rahul_Kumar.pdf',
        fileType: 'application/pdf',
        fileSize: 420000,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAEr5HIKWTAxMDcxNVUwAAILAzI=...demo_document',
        notes: 'Discharged in stable hemodynamic status. Blood work within physiological limits.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'doc_002',
        patientId: RAHUL_ID,
        uploadedBy: { _id: DOCTOR_ID, name: 'Dr. Ananya Sharma', role: 'DOCTOR' },
        uploaderRole: 'DOCTOR',
        facilityName: 'Primary Health Centre (PHC), Shirur Rural',
        documentType: 'PRESCRIPTION',
        title: 'Initial Outpatient Prescription Slip',
        fileName: 'Prescription_2026_09.png',
        fileType: 'image/png',
        fileSize: 185000,
        fileData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        notes: 'Advised Paracetamol 500mg, Cetirizine, and complete rest.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Audit Logs
    this.auditLogs = [
      {
        _id: 'aud_001',
        actorUserId: DOCTOR_ID,
        actorName: 'Dr. Ananya Sharma',
        actorRole: 'DOCTOR',
        action: 'REFERRAL_CREATE',
        resourceType: 'REFERRAL',
        resourceId: '66d000000000000000000041',
        facilityId: 'fac_shirur_phc',
        district: 'Pune',
        status: 'SUCCESS',
        details: 'Referred patient Rahul Kumar to District Hospital with token SS-REF-2026-8X4K29',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'aud_002',
        actorUserId: HOSPITAL_USER_ID,
        actorName: 'Dr. Suresh Patil',
        actorRole: 'DISTRICT_HOSPITAL',
        action: 'REFERRAL_TOKEN_VALIDATE',
        resourceType: 'REFERRAL',
        resourceId: 'SS-REF-2026-8X4K29',
        facilityId: 'fac_pune_dh',
        district: 'Pune',
        status: 'SUCCESS',
        details: 'Validated referral token for Rahul Kumar and accepted referral.',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'aud_003',
        actorUserId: HOSPITAL_USER_ID,
        actorName: 'Dr. Suresh Patil',
        actorRole: 'DISTRICT_HOSPITAL',
        action: 'BED_ASSIGN',
        resourceType: 'BED',
        resourceId: 'GEN-M-12',
        facilityId: 'fac_pune_dh',
        district: 'Pune',
        status: 'SUCCESS',
        details: 'Assigned bed GEN-M-12 in General Male Ward to Rahul Kumar.',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  // --- Auth Helpers ---
  authenticateUser(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();

    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    );

    if (!user) return null;

    const isMatch = password === 'Demo@123' || (user.tempPassword && user.tempPassword === password);
    if (!isMatch) return null;

    return user;
  }

  findUserById(id) {
    return this.users.find((u) => u._id === id || u.id === id) || null;
  }

  // --- Patient Handlers ---
  getPatients(req, res) {
    const { search, risk, village, district } = req.query;
    let list = [...this.patients];

    if (search) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.patientId.toLowerCase().includes(s) ||
          p.phone.includes(s) ||
          p.village.toLowerCase().includes(s)
      );
    }

    if (village) {
      const v = village.trim().toLowerCase();
      list = list.filter((p) => p.village.toLowerCase().includes(v));
    }

    if (district) {
      const d = district.trim().toLowerCase();
      list = list.filter((p) => (p.district || '').toLowerCase().includes(d));
    }

    const enriched = list.map((patient) => {
      const patientVisits = this.visits
        .filter((v) => (v.patientId?._id || v.patientId) === patient._id)
        .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
      const latestVisit = patientVisits[0] || null;

      const pendingFollowup = this.followups.find(
        (f) =>
          (f.patientId?._id || f.patientId) === patient._id &&
          f.status === 'PENDING'
      ) || null;

      return {
        ...patient,
        latestVisit,
        currentRisk: patient.currentRisk || latestVisit?.riskLevel || 'PENDING_REVIEW',
        suggestedRisk: latestVisit?.suggestedRisk || 'GREEN',
        pendingFollowup,
      };
    }).filter((p) => {
      if (!risk) return true;
      return p.currentRisk === risk.toUpperCase();
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      total: enriched.length,
      data: enriched,
    });
  }

  getPatientById(req, res) {
    // Patient data isolation check
    if (req.user?.role === 'PATIENT' && req.user.patientId?.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Patients can only access their own health records.',
      });
    }

    const patient = this.patients.find((p) => p._id === req.params.id || p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const visits = this.visits
      .filter((v) => (v.patientId?._id || v.patientId) === patient._id)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    const consultations = this.consultations
      .filter((c) => (c.patientId?._id || c.patientId) === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const referrals = this.referrals
      .filter((r) => (r.patientId?._id || r.patientId) === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const followups = this.followups
      .filter((f) => (f.patientId?._id || f.patientId) === patient._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const encounters = this.hospitalEncounters
      .filter((e) => e.patientId === patient._id)
      .sort((a, b) => new Date(b.admissionDate || b.createdAt) - new Date(a.admissionDate || a.createdAt));

    const documents = this.medicalDocuments
      .filter((d) => d.patientId === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Build unified chronological timeline
    const timeline = [];

    // Registration event
    timeline.push({
      type: 'REGISTRATION',
      date: patient.createdAt,
      title: 'Patient Registered',
      description: `Registered by ${patient.createdBy?.name || 'Frontline Worker'} at ${patient.village}, ${patient.district}`,
      badge: 'Completed',
      badgeColor: 'teal',
      data: patient,
    });

    // Visits
    visits.forEach((v) => {
      const isConfirmed = v.riskLevel && v.riskLevel !== 'PENDING_REVIEW';
      timeline.push({
        type: 'VISIT',
        date: v.visitDate,
        title: `Vitals & Symptoms Screened`,
        description: isConfirmed
          ? `Doctor Confirmed Risk: ${v.riskLevel}. Recorded by ${v.recordedBy?.name || 'ASHA Worker'}`
          : `Frontline screening recorded by ${v.recordedBy?.name || 'ASHA Worker'}. Suggested Indicator: ${v.suggestedRisk || 'GREEN'} (Awaiting Doctor Review).`,
        badge: isConfirmed ? v.riskLevel : 'PENDING_REVIEW',
        badgeColor: v.riskLevel === 'RED' ? 'red' : v.riskLevel === 'YELLOW' ? 'amber' : 'green',
        data: v,
      });
    });

    // Doctor Risk Assessment Event
    if (patient.currentRisk && patient.currentRisk !== 'PENDING_REVIEW' && patient.riskAssessedAt) {
      timeline.push({
        type: 'RISK_ASSESSMENT',
        date: patient.riskAssessedAt,
        title: `Doctor Confirmed Risk: ${patient.currentRisk}`,
        description: patient.riskNote
          ? `Assessed by Dr. ${patient.riskAssessedBy?.name || 'Doctor'}. Rationale: ${patient.riskNote}`
          : `Assessed by Dr. ${patient.riskAssessedBy?.name || 'Doctor'}.`,
        badge: patient.currentRisk,
        badgeColor: patient.currentRisk === 'RED' ? 'red' : patient.currentRisk === 'YELLOW' ? 'amber' : 'green',
        data: { riskLevel: patient.currentRisk, note: patient.riskNote },
      });
    }

    // Consultations
    consultations.forEach((c) => {
      timeline.push({
        type: 'CONSULTATION',
        date: c.createdAt,
        title: 'Doctor Clinical Consultation',
        description: `Evaluated by Dr. ${c.doctorId?.name}. Clinical Impression: ${c.assessment}`,
        badge: 'Consulted',
        badgeColor: 'blue',
        data: c,
      });
    });

    // Referrals
    referrals.forEach((r) => {
      timeline.push({
        type: 'REFERRAL',
        date: r.createdAt,
        title: `Hospital Referral: ${r.facility}`,
        description: `Token: ${r.referralToken || 'Standard'} | Department: ${r.department} | Priority: ${r.priority} | Status: ${r.status}`,
        badge: r.status,
        badgeColor: r.status === 'COMPLETED' ? 'green' : 'purple',
        data: r,
      });
    });

    // Hospital Encounters / Admissions / Treatments
    encounters.forEach((e) => {
      timeline.push({
        type: e.encounterType === 'EMERGENCY_DIRECT' ? 'EMERGENCY_ENCOUNTER' : 'HOSPITAL_TREATMENT',
        date: e.admissionDate || e.createdAt,
        title: e.encounterType === 'EMERGENCY_DIRECT' ? `Emergency Care: ${e.hospitalName}` : `Hospital Treatment: ${e.hospitalName}`,
        description: `Attending: ${e.attendingDoctor} | Diagnosis: ${e.diagnosis} | Status: ${e.status}${e.bedNumber ? ' (Bed: ' + e.bedNumber + ')' : ''}`,
        badge: e.status,
        badgeColor: e.encounterType === 'EMERGENCY_DIRECT' ? 'red' : 'indigo',
        data: e,
      });
    });

    // Uploaded Documents
    documents.forEach((d) => {
      timeline.push({
        type: 'DOCUMENT',
        date: d.createdAt,
        title: `Medical Document: ${d.title}`,
        description: `Type: ${d.documentType} | Uploaded by ${d.uploadedBy?.name || 'Hospital Staff'} (${d.uploaderRole})`,
        badge: d.documentType,
        badgeColor: 'slate',
        data: d,
      });
    });

    // Follow-ups
    followups.forEach((f) => {
      timeline.push({
        type: 'FOLLOWUP',
        date: f.date,
        title: `Follow-up Home Visit (${f.status})`,
        description: `Instructions: ${f.instructions}`,
        badge: f.status,
        badgeColor: f.status === 'COMPLETED' ? 'green' : f.status === 'MISSED' ? 'red' : 'amber',
        data: f,
      });
    });

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestVisit = visits[0] || null;

    res.status(200).json({
      success: true,
      data: {
        patient,
        currentRisk: patient.currentRisk || latestVisit?.riskLevel || 'PENDING_REVIEW',
        suggestedRisk: latestVisit?.suggestedRisk || 'GREEN',
        suggestedRiskReasons: latestVisit?.suggestedRiskReasons || [],
        latestVisit,
        visits,
        consultations,
        referrals,
        encounters,
        documents,
        followups,
        timeline,
      },
    });
  }

  createPatient(req, res) {
    const {
      name,
      age,
      gender,
      phone,
      address,
      village,
      district,
      state,
      emergencyContact,
      bloodGroup,
      allergies,
      existingConditions,
    } = req.body;

    // Enforce strictly 10-digit Indian phone validation
    if (!validateIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Exactly 10 digits are required (e.g. 9876543210).',
      });
    }

    const cleanPhone = phone.replace(/[\s\-]/g, '');

    // Check duplicate unless explicitly allowed
    const isDuplicate = this.patients.some(
      (p) => p.phone === cleanPhone && p.name.toLowerCase() === (name || '').trim().toLowerCase()
    );
    if (isDuplicate && !req.body.allowDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `Possible existing patient found with name '${name}' and phone '${phone}'.`,
      });
    }

    const newId = `66d0000000000000000000${(this.patients.length + 10).toString(16).padStart(2, '0')}`;
    const seq = (this.patients.length + 1).toString().padStart(4, '0');
    const patientId = `SS-2026-${seq}`;

    const newPatient = {
      _id: newId,
      id: newId,
      patientId,
      name: (name || '').trim(),
      age: Number(age),
      gender,
      phone: cleanPhone,
      address: address || '',
      village: (village || '').trim(),
      district: district ? district.trim() : 'Pune',
      state: state || 'Maharashtra',
      emergencyContact: emergencyContact || '',
      bloodGroup: bloodGroup || 'Unknown',
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      existingConditions: Array.isArray(existingConditions) ? existingConditions : existingConditions ? [existingConditions] : [],
      currentRisk: 'PENDING_REVIEW',
      createdBy: { _id: req.user?._id || ASHA_ID, name: req.user?.name || 'Sunita Devi (ASHA)', role: req.user?.role || 'ASHA' },
      createdAt: new Date().toISOString(),
    };

    this.patients.unshift(newPatient);

    const cleanSeq = patientId.replace(/[^0-9]/g, '');
    const username = `patient${cleanSeq}`;
    const tempPassword = `Patient@${Math.floor(1000 + Math.random() * 9000)}`;

    const patientUser = {
      _id: `66d0000000000000000000${(this.users.length + 50).toString(16).padStart(2, '0')}`,
      name: newPatient.name,
      username,
      email: `${username}@patient.swasthyasetu.org`,
      role: 'PATIENT',
      patientId: newPatient._id,
      phone: newPatient.phone,
      language: 'en',
      tempPassword,
    };
    this.users.push(patientUser);

    const creds = {
      label: 'Patient Login Credentials — Demo',
      patientId: newPatient.patientId,
      username,
      tempPassword,
      temporaryPassword: tempPassword,
      name: newPatient.name,
      role: 'PATIENT',
    };

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient,
      credentials: creds,
      userCredentials: creds,
    });
  }

  updatePatient(req, res) {
    const patient = this.patients.find((p) => p._id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    if (req.body.phone && !validateIndianPhone(req.body.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be strictly 10 digits.',
      });
    }

    Object.assign(patient, req.body);
    res.status(200).json({ success: true, message: 'Patient profile updated successfully', data: patient });
  }

  checkDuplicate(req, res) {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(200).json({ isDuplicate: false });

    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const existing = this.patients.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase() && p.phone === cleanPhone
    );

    if (existing) {
      return res.status(200).json({
        isDuplicate: true,
        patient: existing,
        message: `Possible existing patient found: '${existing.name}' (${existing.patientId}) with matching phone in ${existing.village}.`,
      });
    }

    res.status(200).json({ isDuplicate: false });
  }

  assessRiskByDoctor(req, res) {
    const { riskLevel, riskReason, reason, visitId } = req.body;
    const finalReason = riskReason || reason || '';
    const patient = this.patients.find((p) => p._id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    patient.currentRisk = riskLevel;
    patient.riskNote = finalReason;
    patient.riskAssessedBy = { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' };
    patient.riskAssessedAt = new Date().toISOString();

    let visit = null;
    if (visitId) {
      visit = this.visits.find((v) => v._id === visitId);
    } else {
      visit = this.visits.find((v) => (v.patientId?._id || v.patientId) === patient._id);
    }

    if (visit) {
      visit.riskLevel = riskLevel;
      visit.doctorRiskNote = finalReason;
      visit.assessedBy = { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' };
      visit.assessedAt = new Date().toISOString();
      visit.status = 'REVIEWED';
    }

    res.status(200).json({
      success: true,
      message: `Authoritative clinical risk assessment confirmed as ${riskLevel} by doctor`,
      currentRisk: patient.currentRisk,
      riskNote: patient.riskNote,
      data: { patient, visit, currentRisk: patient.currentRisk, riskNote: patient.riskNote },
    });
  }

  getPatientJourney(req, res) {
    const patient = this.patients.find((p) => p._id === req.user?.patientId || p._id === RAHUL_ID);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found.' });
    }

    const latestVisit = this.visits
      .filter((v) => (v.patientId?._id || v.patientId) === patient._id)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))[0] || null;

    const consultations = this.consultations
      .filter((c) => (c.patientId?._id || c.patientId) === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const referrals = this.referrals
      .filter((r) => (r.patientId?._id || r.patientId) === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const encounters = this.hospitalEncounters
      .filter((e) => e.patientId === patient._id)
      .sort((a, b) => new Date(b.admissionDate || b.createdAt) - new Date(a.admissionDate || a.createdAt));

    const documents = this.medicalDocuments
      .filter((d) => d.patientId === patient._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const followups = this.followups
      .filter((f) => (f.patientId?._id || f.patientId) === patient._id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Structured journey steps
    const journeySteps = [
      {
        step: 1,
        title: 'Patient Registered',
        date: patient.createdAt,
        status: 'COMPLETED',
        description: `Enrolled in village healthcare registry at ${patient.village}, ${patient.district}.`,
      },
    ];

    if (latestVisit) {
      journeySteps.push({
        step: 2,
        title: 'Symptoms & Vitals Screened',
        date: latestVisit.visitDate,
        status: 'COMPLETED',
        description: `Frontline screening captured (Temp: ${latestVisit.vitals?.temperature ? latestVisit.vitals.temperature + '°C' : 'Normal'}, SpO2: ${latestVisit.vitals?.spO2 ? latestVisit.vitals.spO2 + '%' : 'Normal'}).`,
      });
    }

    if (patient.currentRisk && patient.currentRisk !== 'PENDING_REVIEW') {
      const riskLabels = {
        GREEN: 'Routine Care & Monitoring',
        YELLOW: 'Further Medical Attention',
        RED: 'Urgent Clinical Assessment',
      };
      journeySteps.push({
        step: 3,
        title: `Doctor Confirmed Risk: ${patient.currentRisk}`,
        subtitle: riskLabels[patient.currentRisk] || patient.currentRisk,
        date: patient.riskAssessedAt || (consultations[0]?.createdAt),
        status: 'COMPLETED',
        riskLevel: patient.currentRisk,
        description: patient.riskNote || 'Doctor evaluated symptoms and vitals.',
      });
    } else {
      journeySteps.push({
        step: 3,
        title: 'Doctor Review',
        status: 'PENDING',
        description: 'Awaiting clinical review by Medical Officer.',
      });
    }

    if (consultations.length > 0) {
      const c = consultations[0];
      journeySteps.push({
        step: 4,
        title: 'Doctor Consultation & Treatment',
        date: c.createdAt,
        status: 'COMPLETED',
        doctorName: c.doctorId?.name,
        treatment: c.treatmentInstructions,
        advice: c.advice,
        description: c.assessment,
      });
    }

    if (referrals.length > 0) {
      const r = referrals[0];
      journeySteps.push({
        step: 5,
        title: `Hospital Referral: ${r.facility}`,
        date: r.createdAt,
        status: r.status,
        description: `Token: ${r.referralToken || 'Standard'} • ${r.department} • Status: ${r.status}`,
      });
    }

    if (encounters.length > 0) {
      const e = encounters[0];
      journeySteps.push({
        step: 6,
        title: `Hospital Inpatient Care: ${e.hospitalName}`,
        date: e.admissionDate || e.createdAt,
        status: e.status,
        description: `Diagnosis: ${e.diagnosis} • Bed: ${e.bedNumber || 'Assigned'} • Status: ${e.status}`,
      });
    }

    if (documents.length > 0) {
      journeySteps.push({
        step: 7,
        title: `Medical Records & Prescriptions (${documents.length} File${documents.length > 1 ? 's' : ''})`,
        date: documents[0].createdAt,
        status: 'COMPLETED',
        description: `${documents[0].title} uploaded by ${documents[0].facilityName}`,
      });
    }

    if (followups.length > 0) {
      const nextFollowup = followups.find((f) => f.status === 'PENDING') || followups[followups.length - 1];
      journeySteps.push({
        step: 8,
        title: `Follow-up Home Visit (${nextFollowup.status})`,
        date: nextFollowup.date,
        status: nextFollowup.status,
        description: nextFollowup.instructions,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patient,
        latestVisit,
        currentRisk: patient.currentRisk,
        consultations,
        referrals,
        encounters,
        documents,
        followups,
        journeySteps,
      },
    });
  }

  // --- Visit Handlers ---
  getVisitsByPatient(req, res) {
    const visits = this.visits
      .filter((v) => (v.patientId?._id || v.patientId) === req.params.id)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    res.status(200).json({ success: true, count: visits.length, data: visits });
  }

  createVisit(req, res) {
    const { symptoms, vitals, notes } = req.body;
    const patientId = req.params.id;
    const patient = this.patients.find((p) => p._id === patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const suggestedIndicators = assessRisk({ symptoms, vitals });
    const isDoctor = req.user?.role === 'DOCTOR';
    const riskLevel = isDoctor ? suggestedIndicators.level : 'PENDING_REVIEW';

    const newVisit = {
      _id: `66d0000000000000000000${(this.visits.length + 30).toString(16).padStart(2, '0')}`,
      patientId,
      recordedBy: { _id: req.user?._id || ASHA_ID, name: req.user?.name || 'Sunita Devi (ASHA)', role: req.user?.role || 'ASHA' },
      symptoms: symptoms || [],
      vitals: vitals || {},
      suggestedRisk: suggestedIndicators.level,
      suggestedRiskReasons: suggestedIndicators.reasons,
      riskLevel,
      status: isDoctor ? 'REVIEWED' : 'PENDING_REVIEW',
      assessedBy: isDoctor ? { _id: req.user._id, name: req.user.name, role: req.user.role } : undefined,
      assessedAt: isDoctor ? new Date().toISOString() : undefined,
      notes: notes || '',
      visitDate: new Date().toISOString(),
    };

    this.visits.unshift(newVisit);

    patient.currentRisk = riskLevel;
    if (isDoctor) {
      patient.riskAssessedBy = { _id: req.user._id, name: req.user.name, role: 'DOCTOR' };
      patient.riskAssessedAt = new Date().toISOString();
    }

    res.status(201).json({
      success: true,
      message: 'Symptoms & vitals saved. Case forwarded for doctor clinical review.',
      suggestedRiskIndicators: suggestedIndicators,
      data: newVisit,
    });
  }

  // --- Consultation Handlers ---
  getConsultationsByPatient(req, res) {
    const consultations = this.consultations
      .filter((c) => (c.patientId?._id || c.patientId) === req.params.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: consultations.length, data: consultations });
  }

  createConsultation(req, res) {
    const { visitId, observations, assessment, advice, treatmentInstructions, followUpDate } = req.body;
    const patientId = req.params.id;
    const patient = this.patients.find((p) => p._id === patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    if (!observations || !assessment) {
      return res.status(400).json({ success: false, message: 'Doctor clinical observations and assessment are required' });
    }

    const newConsultation = {
      _id: `66d0000000000000000000${(this.consultations.length + 40).toString(16).padStart(2, '0')}`,
      patientId,
      doctorId: { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' },
      visitId: visitId || null,
      observations,
      assessment,
      advice: advice || '',
      treatmentInstructions: treatmentInstructions || '',
      followUpDate: followUpDate || null,
      createdAt: new Date().toISOString(),
    };

    this.consultations.unshift(newConsultation);

    if (visitId) {
      const v = this.visits.find((vis) => vis._id === visitId);
      if (v) v.status = 'CONSULTED';
    }

    let createdFollowup = null;
    if (followUpDate) {
      createdFollowup = {
        _id: `66d0000000000000000000${(this.followups.length + 60).toString(16).padStart(2, '0')}`,
        patientId: {
          _id: patient._id,
          patientId: patient.patientId,
          name: patient.name,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
          village: patient.village,
          district: patient.district,
        },
        doctorId: { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' },
        date: new Date(followUpDate).toISOString(),
        instructions: advice || treatmentInstructions || 'Follow-up clinical assessment',
        status: 'PENDING',
      };
      this.followups.unshift(createdFollowup);
    }

    res.status(201).json({
      success: true,
      message: 'Consultation record saved successfully',
      data: newConsultation,
      followup: createdFollowup,
    });
  }

  // --- Referral Handlers ---
  getReferrals(req, res) {
    const { status, priority, search } = req.query;
    let list = [...this.referrals];

    if (status) {
      list = list.filter((r) => r.status === status.toUpperCase());
    }
    if (priority) {
      list = list.filter((r) => r.priority === priority.toUpperCase());
    }
    if (search) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.patientId && r.patientId.name?.toLowerCase().includes(s)) ||
          (r.patientId && r.patientId.patientId?.toLowerCase().includes(s)) ||
          r.facility?.toLowerCase().includes(s) ||
          r.department?.toLowerCase().includes(s) ||
          r.referralToken?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  }

  getReferralById(req, res) {
    const referral = this.referrals.find((r) => r._id === req.params.id || r.referralToken === req.params.id);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    res.status(200).json({ success: true, data: referral });
  }

  createReferral(req, res) {
    const { patientId, reason, facility, hospitalId, department, priority = 'ROUTINE', instructions } = req.body;
    const patient = this.patients.find((p) => p._id === patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    if (!reason || !facility || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide referral reason, destination facility, and department',
      });
    }

    const referralToken = generateReferralToken();

    const newReferral = {
      _id: `66d0000000000000000000${(this.referrals.length + 50).toString(16).padStart(2, '0')}`,
      referralToken,
      patientId: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        village: patient.village,
        district: patient.district,
      },
      doctorId: { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' },
      reason,
      facility,
      hospitalId: hospitalId || 'fac_pune_dh',
      department,
      priority: priority.toUpperCase(),
      instructions: instructions || '',
      status: 'CREATED',
      statusHistory: [
        {
          status: 'CREATED',
          updatedBy: { name: req.user?.name || 'Dr. Ananya Sharma', role: req.user?.role || 'DOCTOR' },
          note: `Referral initiated by doctor with unique token ${referralToken}`,
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.referrals.unshift(newReferral);
    res.status(201).json({ success: true, message: 'Patient referral created successfully', data: newReferral });
  }

  updateReferralStatus(req, res) {
    const { status, note, bedNumber, treatmentSummary } = req.body;
    const referral = this.referrals.find((r) => r._id === req.params.id);

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    // Strict state machine validation: CREATED -> ACCEPTED -> PATIENT ARRIVED -> COMPLETED
    const validTransitions = {
      'CREATED': ['ACCEPTED'],
      'ACCEPTED': ['PATIENT ARRIVED'],
      'PATIENT ARRIVED': ['COMPLETED'],
      'COMPLETED': [],
    };

    const allowedNext = validTransitions[referral.status] || [];
    if (status !== referral.status && !allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid referral status transition from '${referral.status}' to '${status}'. Expected next step: ${allowedNext.join(', ') || 'None (Already Completed)'}`,
      });
    }

    referral.status = status;
    if (bedNumber) referral.bedNumber = bedNumber;
    if (treatmentSummary) referral.treatmentSummary = treatmentSummary;

    referral.statusHistory.push({
      status,
      updatedBy: { name: req.user?.name || 'Staff', role: req.user?.role || 'DOCTOR' },
      note: note || `Referral status updated to ${status}`,
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true, message: `Referral status updated to ${status}`, data: referral });
  }

  // --- Followup Handlers ---
  getFollowups(req, res) {
    const { status, search } = req.query;
    let list = [...this.followups];

    if (status) {
      list = list.filter((f) => f.status === status.toUpperCase());
    }
    if (search) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (f) =>
          (f.patientId && f.patientId.name?.toLowerCase().includes(s)) ||
          (f.patientId && f.patientId.patientId?.toLowerCase().includes(s)) ||
          f.instructions?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  }

  createFollowup(req, res) {
    const { patientId, date, dueDate, instructions, notes } = req.body;
    const targetDate = date || dueDate;
    const patient = this.patients.find((p) => p._id === patientId);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const newFollowup = {
      _id: `66d0000000000000000000${(this.followups.length + 70).toString(16).padStart(2, '0')}`,
      patientId: {
        _id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        village: patient.village,
        district: patient.district,
      },
      doctorId: { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Dr. Ananya Sharma', role: 'DOCTOR' },
      date: new Date(targetDate).toISOString(),
      instructions,
      notes: notes || '',
      status: 'PENDING',
    };

    this.followups.unshift(newFollowup);
    res.status(201).json({ success: true, message: 'Follow-up scheduled successfully', data: newFollowup });
  }

  updateFollowup(req, res) {
    const { status, notes } = req.body;
    const followup = this.followups.find((f) => f._id === req.params.id);

    if (!followup) {
      return res.status(404).json({ success: false, message: 'Follow-up record not found' });
    }

    if (status) {
      followup.status = status;
      if (status === 'COMPLETED') {
        followup.completedAt = new Date().toISOString();
        followup.completedBy = { _id: req.user?._id || ASHA_ID, name: req.user?.name || 'Sunita Devi (ASHA)', role: req.user?.role || 'ASHA' };
      }
    }

    if (notes !== undefined) {
      followup.notes = notes;
    }

    res.status(200).json({ success: true, message: `Follow-up marked as ${followup.status}`, data: followup });
  }

  // --- Dashboards ---
  getAshaDashboard(req, res) {
    const totalPatients = this.patients.length;
    const pendingReferralsCount = this.referrals.filter((r) =>
      ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status)
    ).length;
    const upcomingFollowupsCount = this.followups.filter((f) => f.status === 'PENDING').length;
    const recentlyRegisteredCount = this.patients.length;

    const recentPatients = this.patients.slice(0, 6).map((p) => {
      const lastVisit = this.visits.find((v) => (v.patientId?._id || v.patientId) === p._id) || null;
      return {
        ...p,
        lastVisit,
        currentRisk: p.currentRisk || lastVisit?.riskLevel || 'GREEN',
      };
    });

    const pendingFollowups = this.followups.filter((f) => f.status === 'PENDING').slice(0, 6);
    const activeReferrals = this.referrals
      .filter((r) => ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status))
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalPatients,
          pendingReferrals: pendingReferralsCount,
          upcomingFollowups: upcomingFollowupsCount,
          recentlyRegistered: recentlyRegisteredCount,
        },
        recentPatients,
        pendingFollowups,
        pendingReferrals: activeReferrals,
      },
    });
  }

  getDoctorDashboard(req, res) {
    const pendingReviewVisits = this.visits
      .filter((v) => v.status === 'PENDING_REVIEW' || v.riskLevel === 'RED' || v.riskLevel === 'YELLOW')
      .map((v) => {
        const patient = this.patients.find((p) => p._id === (v.patientId?._id || v.patientId));
        return {
          ...v,
          patientId: patient || { name: 'Unknown', patientId: 'SS-0000', age: 30, gender: 'Unknown', village: 'Shirur' },
        };
      });

    const priorityWeight = { RED: 3, YELLOW: 2, GREEN: 1, PENDING_REVIEW: 2 };
    pendingReviewVisits.sort((a, b) => (priorityWeight[b.riskLevel] || 1) - (priorityWeight[a.riskLevel] || 1));

    const totalAwaitingReview = pendingReviewVisits.length;
    const todayConsultationsCount = this.consultations.length;
    const pendingReferralsCount = this.referrals.filter((r) =>
      ['CREATED', 'ACCEPTED'].includes(r.status)
    ).length;
    const upcomingFollowupsCount = this.followups.filter((f) => f.status === 'PENDING').length;

    const recentConsultations = this.consultations.slice(0, 5).map((c) => {
      const patient = this.patients.find((p) => p._id === (c.patientId?._id || c.patientId));
      return {
        ...c,
        patientId: patient || { name: 'Rahul Kumar', patientId: 'SS-2026-0001', age: 35, gender: 'Male', village: 'Shirur' },
      };
    });

    const activeReferrals = this.referrals
      .filter((r) => ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status))
      .slice(0, 5);

    const upcomingFollowups = this.followups.filter((f) => f.status === 'PENDING').slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          patientsAwaitingReview: totalAwaitingReview,
          todayConsultations: todayConsultationsCount,
          pendingReferrals: pendingReferralsCount,
          upcomingFollowups: upcomingFollowupsCount,
        },
        patientsRequiringReview: pendingReviewVisits,
        recentConsultations,
        pendingReferrals: activeReferrals,
        upcomingFollowups,
      },
    });
  }

  // --- Maharashtra State Health Department Monitoring Handlers ---
  getHealthAdminOverview(req, res) {
    const { district } = req.query;
    let patients = [...this.patients];
    let referrals = [...this.referrals];
    let followups = [...this.followups];
    let inventory = [...this.inventory];
    let facilities = [...this.facilities];

    if (district && district !== 'All') {
      const dLower = district.trim().toLowerCase();
      patients = patients.filter((p) => (p.district || '').toLowerCase().includes(dLower));
      referrals = referrals.filter((r) => (r.patientId?.district || '').toLowerCase().includes(dLower));
      inventory = inventory.filter((i) => (i.district || '').toLowerCase().includes(dLower));
      facilities = facilities.filter((f) => (f.district || '').toLowerCase().includes(dLower));
    }

    const totalPatients = patients.length;
    const activeJourneys = patients.length;
    const pendingReviews = this.visits.filter((v) => v.status === 'PENDING_REVIEW').length;
    const activeReferrals = referrals.filter((r) => ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status)).length;
    const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED').length;
    const pendingFollowups = followups.filter((f) => f.status === 'PENDING').length;
    const missedFollowups = followups.filter((f) => f.status === 'MISSED').length;
    const highPriorityCases = patients.filter((p) => p.currentRisk === 'RED').length;
    const moderateCases = patients.filter((p) => p.currentRisk === 'YELLOW').length;

    const lowStockFacilities = inventory.filter((i) => i.status === 'LOW_STOCK').length;
    const outOfStockFacilities = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;

    const totalBeds = facilities.reduce((sum, f) => sum + (f.totalBeds || 0), 0);
    const availableBeds = facilities.reduce((sum, f) => sum + (f.availableBeds || 0), 0);
    const occupiedBeds = Math.max(0, totalBeds - availableBeds);

    res.status(200).json({
      success: true,
      data: {
        isDemoPilotData: true,
        state: 'Maharashtra',
        selectedDistrict: district || 'All Districts',
        lastUpdated: new Date().toISOString(),
        metrics: {
          totalPatients,
          activeJourneys,
          pendingReviews,
          activeReferrals,
          completedReferrals,
          pendingFollowups,
          missedFollowups,
          highPriorityCases,
          moderateCases,
          lowStockFacilities,
          outOfStockFacilities,
          totalBeds,
          availableBeds,
          occupiedBeds,
        },
      },
    });
  }

  getHealthAdminSurveillance(req, res) {
    const { district } = req.query;
    let visits = [...this.visits];
    let patients = [...this.patients];

    if (district && district !== 'All') {
      const dLower = district.trim().toLowerCase();
      patients = patients.filter((p) => (p.district || '').toLowerCase().includes(dLower));
      const pIds = patients.map((p) => p._id);
      visits = visits.filter((v) => pIds.includes(v.patientId?._id || v.patientId));
    }

    // Aggregate symptom frequency
    const symptomCounts = {};
    visits.forEach((v) => {
      (v.symptoms || []).forEach((s) => {
        const name = s.name || 'Other';
        symptomCounts[name] = (symptomCounts[name] || 0) + 1;
      });
    });

    const symptomTrends = Object.keys(symptomCounts).map((symptom) => ({
      symptom,
      count: symptomCounts[symptom],
      severity: symptom.toLowerCase().includes('breath') || symptom.toLowerCase().includes('chest') ? 'URGENT' : 'MONITOR',
    })).sort((a, b) => b.count - a.count);

    const highRiskCount = patients.filter((p) => p.currentRisk === 'RED').length;
    const moderateRiskCount = patients.filter((p) => p.currentRisk === 'YELLOW').length;
    const routineCount = patients.filter((p) => p.currentRisk === 'GREEN').length;

    res.status(200).json({
      success: true,
      data: {
        disclaimer: 'System-generated operational monitoring indicators based on actual SwasthyaSetu registered health records.',
        symptomTrends,
        riskDistribution: {
          RED: highRiskCount,
          YELLOW: moderateRiskCount,
          GREEN: routineCount,
        },
        referralDelays: [
          { district: 'Pune', averageHours: 18.5, overdueCount: 1 },
          { district: 'Satara', averageHours: 14.2, overdueCount: 0 },
        ],
        facilityWorkload: [
          { facility: 'District Hospital, Aundh, Pune', totalTreated: 42, bedsOccupied: 308, occupancyRate: 88 },
          { facility: 'Kranti Sinh Nana Patil District Hospital, Satara', totalTreated: 28, bedsOccupied: 244, occupancyRate: 87 },
          { facility: 'Primary Health Centre, Shirur Rural', totalTreated: 65, bedsOccupied: 7, occupancyRate: 58 },
        ],
      },
    });
  }

  getHealthAdminFacilities(req, res) {
    const facilitiesWithMetrics = this.facilities.map((f) => {
      const facilityReferrals = this.referrals.filter((r) => r.hospitalId === f.id || r.facility.includes(f.name));
      const facilityStock = this.inventory.filter((i) => i.facilityId === f.id);
      const lowStockCount = facilityStock.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length;

      return {
        ...f,
        activeReferrals: facilityReferrals.filter((r) => ['CREATED', 'ACCEPTED'].includes(r.status)).length,
        stockStatus: lowStockCount > 0 ? 'NEEDS_ATTENTION' : 'HEALTHY',
        lowStockItemsCount: lowStockCount,
      };
    });

    const ashaWorkers = this.users
      .filter((u) => u.role === 'ASHA')
      .map((asha) => {
        const ashaPatients = this.patients.filter((p) => (p.createdBy?._id || p.createdBy) === asha._id);
        const ashaFollowups = this.followups.filter((f) => ashaPatients.some((p) => p._id === f.patientId?._id));
        return {
          id: asha._id,
          name: asha.name,
          phone: asha.phone,
          district: asha.assignedDistrict || 'Pune',
          block: asha.assignedBlock || 'Shirur',
          registeredPatientsCount: ashaPatients.length,
          pendingFollowupsCount: ashaFollowups.filter((f) => f.status === 'PENDING').length,
          status: 'ACTIVE',
        };
      });

    res.status(200).json({
      success: true,
      data: {
        facilities: facilitiesWithMetrics,
        ashaWorkers,
      },
    });
  }

  getHealthAdminInventory(req, res) {
    const lowStock = this.inventory.filter((i) => i.status === 'LOW_STOCK');
    const outOfStock = this.inventory.filter((i) => i.status === 'OUT_OF_STOCK');
    const expiringSoon = this.inventory.filter((i) => i.status === 'EXPIRING_SOON');

    res.status(200).json({
      success: true,
      data: {
        totalItemsCount: this.inventory.length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        expiringSoonCount: expiringSoon.length,
        items: this.inventory,
        anomalies: [
          {
            facilityName: 'District Hospital, Aundh, Pune',
            itemName: 'Inj. Ceftriaxone 1g',
            type: 'OUT_OF_STOCK_ANOMALY',
            note: 'Antibiotic stock reached zero. State drug warehouse requisition recommended.',
          },
        ],
      },
    });
  }

  getHealthAdminAuditLogs(req, res) {
    const { action, role } = req.query;
    let logs = [...this.auditLogs];

    if (action) {
      logs = logs.filter((l) => l.action === action);
    }
    if (role) {
      logs = logs.filter((l) => l.actorRole === role);
    }

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  }

  // --- District Hospital Handlers ---
  getHospitalDashboard(req, res) {
    const hospitalId = req.user?.facilityId || 'fac_pune_dh';
    const incomingReferrals = this.referrals.filter(
      (r) => ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status)
    );

    const hospitalBeds = this.beds.filter((b) => b.facilityId === hospitalId);
    const totalBeds = hospitalBeds.length;
    const occupiedBeds = hospitalBeds.filter((b) => b.status === 'OCCUPIED').length;
    const availableBeds = totalBeds - occupiedBeds;

    const recentTreatments = this.hospitalEncounters.filter((e) => e.facilityId === hospitalId);
    const lowStockItems = this.inventory.filter(
      (i) => i.facilityId === hospitalId && (i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK')
    );

    res.status(200).json({
      success: true,
      data: {
        hospitalName: req.user?.facilityName || 'District Hospital, Aundh, Pune',
        metrics: {
          incomingReferralsCount: incomingReferrals.length,
          totalBeds,
          occupiedBeds,
          availableBeds,
          activeInpatients: occupiedBeds,
          lowStockCount: lowStockItems.length,
        },
        incomingReferrals,
        beds: hospitalBeds,
        recentTreatments,
        lowStockItems,
      },
    });
  }

  validateReferralToken(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Referral token is required' });
    }

    const cleanToken = token.trim().toUpperCase();
    const referral = this.referrals.find((r) => (r.referralToken || '').toUpperCase() === cleanToken);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral token. No active hospital referral found matching this code.',
      });
    }

    const patient = this.patients.find((p) => p._id === (referral.patientId?._id || referral.patientId));

    res.status(200).json({
      success: true,
      message: 'Referral token verified successfully',
      data: {
        referral,
        patient,
      },
    });
  }

  emergencyPatientLookup(req, res) {
    const { patientId, phone, reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Emergency Break-Glass justification reason is required (e.g. Trauma, Cardiac Event).',
      });
    }

    let patient = null;
    if (patientId) {
      const cleanId = patientId.trim();
      patient = this.patients.find((p) => p.patientId === cleanId || p._id === cleanId);
    } else if (phone) {
      const cleanPhone = phone.replace(/[\s\-]/g, '');
      patient = this.patients.find((p) => p.phone === cleanPhone);
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found in emergency registry.',
      });
    }

    // Log break-glass emergency access
    this.auditLogs.unshift({
      _id: 'aud_emg_' + Date.now(),
      actorUserId: req.user?._id || HOSPITAL_USER_ID,
      actorName: req.user?.name || 'Emergency Medical Officer',
      actorRole: req.user?.role || 'DISTRICT_HOSPITAL',
      action: 'EMERGENCY_PATIENT_ACCESS',
      resourceType: 'PATIENT',
      resourceId: patient.patientId,
      district: patient.district,
      status: 'SUCCESS',
      details: `Break-glass emergency lookup: ${reason}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Hospital Portal',
      timestamp: new Date().toISOString(),
    });

    const visits = this.visits.filter((v) => (v.patientId?._id || v.patientId) === patient._id);
    const encounters = this.hospitalEncounters.filter((e) => e.patientId === patient._id);

    res.status(200).json({
      success: true,
      message: 'Emergency break-glass access authorized and logged.',
      data: {
        patient,
        latestVisit: visits[0] || null,
        encounters,
        currentRisk: patient.currentRisk,
        allergies: patient.allergies,
        existingConditions: patient.existingConditions,
      },
    });
  }

  createHospitalEncounter(req, res) {
    const {
      patientId,
      referralId,
      encounterType = 'REFERRAL_ADMISSION',
      breakGlassReason,
      attendingDoctor,
      ward,
      bedNumber,
      diagnosis,
      procedures,
      medicinesPrescribed,
      treatmentNotes,
      dischargeInstructions,
      status = 'ADMITTED',
    } = req.body;

    const patient = this.patients.find((p) => p._id === patientId || p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    if (!diagnosis) {
      return res.status(400).json({ success: false, message: 'Clinical diagnosis / assessment is required' });
    }

    const newEncounter = {
      _id: 'enc_' + Date.now(),
      patientId: patient._id,
      facilityId: req.user?.facilityId || 'fac_pune_dh',
      hospitalName: req.user?.facilityName || 'District Hospital, Aundh, Pune',
      referralId: referralId || null,
      encounterType,
      breakGlassReason: breakGlassReason || '',
      attendingDoctor: attendingDoctor || req.user?.name || 'Dr. Suresh Patil',
      ward: ward || 'GENERAL_MALE',
      bedNumber: bedNumber || '',
      admissionDate: new Date().toISOString(),
      dischargeDate: status === 'DISCHARGED' ? new Date().toISOString() : null,
      diagnosis,
      procedures: Array.isArray(procedures) ? procedures : procedures ? [procedures] : [],
      medicinesPrescribed: Array.isArray(medicinesPrescribed) ? medicinesPrescribed : medicinesPrescribed ? [medicinesPrescribed] : [],
      treatmentNotes: treatmentNotes || '',
      dischargeInstructions: dischargeInstructions || '',
      status,
      createdAt: new Date().toISOString(),
    };

    this.hospitalEncounters.unshift(newEncounter);

    // If a bed was specified, update bed status
    if (bedNumber) {
      const bed = this.beds.find((b) => b.bedNumber === bedNumber);
      if (bed) {
        bed.status = status === 'DISCHARGED' ? 'AVAILABLE' : 'OCCUPIED';
        bed.patientId = status === 'DISCHARGED' ? null : patient._id;
        bed.patientName = status === 'DISCHARGED' ? '' : patient.name;
        bed.admissionDate = status === 'DISCHARGED' ? null : new Date().toISOString();
      }
    }

    // If linked to referral and discharged, complete referral
    if (referralId) {
      const ref = this.referrals.find((r) => r._id === referralId);
      if (ref) {
        if (status === 'DISCHARGED') {
          ref.status = 'COMPLETED';
        } else {
          ref.status = 'PATIENT ARRIVED';
        }
        ref.bedNumber = bedNumber || ref.bedNumber;
        ref.treatmentSummary = treatmentNotes || ref.treatmentSummary;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Hospital clinical encounter saved and appended to patient journey.',
      data: newEncounter,
    });
  }

  getHospitalBeds(req, res) {
    const facilityId = req.user?.facilityId || req.query.facilityId || 'fac_pune_dh';
    const beds = this.beds.filter((b) => !facilityId || b.facilityId === facilityId);
    res.status(200).json({ success: true, count: beds.length, data: beds });
  }

  assignBed(req, res) {
    const { bedId, patientId, ward } = req.body;
    const bed = this.beds.find((b) => b._id === bedId || b.bedNumber === bedId);

    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed record not found' });
    }

    const patient = this.patients.find((p) => p._id === patientId);

    bed.status = patient ? 'OCCUPIED' : 'AVAILABLE';
    bed.patientId = patient ? patient._id : null;
    bed.patientName = patient ? patient.name : '';
    bed.admissionDate = patient ? new Date().toISOString() : null;

    res.status(200).json({
      success: true,
      message: `Bed ${bed.bedNumber} status updated to ${bed.status}`,
      data: bed,
    });
  }

  // --- Medical Inventory Handlers ---
  getInventory(req, res) {
    const { facilityId, category, status, search } = req.query;
    let list = [...this.inventory];

    if (facilityId) {
      list = list.filter((i) => i.facilityId === facilityId);
    }
    if (category) {
      list = list.filter((i) => i.category === category.toUpperCase());
    }
    if (status) {
      list = list.filter((i) => i.status === status.toUpperCase());
    }
    if (search) {
      const s = search.trim().toLowerCase();
      list = list.filter((i) => i.itemName.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  }

  addInventoryItem(req, res) {
    const {
      itemName,
      category = 'MEDICINE',
      unit = 'strips',
      quantityAvailable = 0,
      minimumStockLevel = 10,
      maximumStockLevel = 500,
      batchNumber,
      expiryDate,
      notes,
    } = req.body;

    if (!itemName) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const qty = Number(quantityAvailable);
    const minLevel = Number(minimumStockLevel);
    let status = 'IN_STOCK';
    if (qty <= 0) status = 'OUT_OF_STOCK';
    else if (qty <= minLevel) status = 'LOW_STOCK';

    const newItem = {
      _id: 'inv_' + Date.now(),
      facilityId: req.user?.facilityId || 'fac_pune_dh',
      facilityName: req.user?.facilityName || 'District Hospital, Aundh, Pune',
      district: req.user?.assignedDistrict || 'Pune',
      itemName: itemName.trim(),
      category: category.toUpperCase(),
      unit,
      quantityAvailable: qty,
      minimumStockLevel: minLevel,
      maximumStockLevel: Number(maximumStockLevel) || 500,
      batchNumber: batchNumber || '',
      expiryDate: expiryDate || null,
      status,
      lastUpdatedBy: req.user?._id || HOSPITAL_USER_ID,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    this.inventory.unshift(newItem);

    // Record initial movement
    this.inventoryMovements.unshift({
      _id: 'mov_' + Date.now(),
      inventoryItemId: newItem._id,
      facilityId: newItem.facilityId,
      type: 'ADD',
      quantityChanged: qty,
      previousQuantity: 0,
      newQuantity: qty,
      reason: 'Initial stock entry',
      performedBy: { name: req.user?.name || 'Staff', role: req.user?.role || 'DISTRICT_HOSPITAL' },
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Medical inventory item added', data: newItem });
  }

  recordStockMovement(req, res) {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;

    const item = this.inventory.find((i) => i._id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const changeQty = Number(quantity);
    if (isNaN(changeQty) || changeQty === 0) {
      return res.status(400).json({ success: false, message: 'A valid non-zero quantity change is required' });
    }

    const prev = item.quantityAvailable;
    const nextQty = Math.max(0, prev + changeQty);

    item.quantityAvailable = nextQty;
    if (nextQty <= 0) {
      item.status = 'OUT_OF_STOCK';
    } else if (nextQty <= item.minimumStockLevel) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'IN_STOCK';
    }
    item.lastUpdatedBy = req.user?._id || HOSPITAL_USER_ID;

    const movement = {
      _id: 'mov_' + Date.now(),
      inventoryItemId: item._id,
      facilityId: item.facilityId,
      type: type || (changeQty > 0 ? 'ADD' : 'DISPENSE'),
      quantityChanged: changeQty,
      previousQuantity: prev,
      newQuantity: nextQty,
      reason: reason || 'Stock update',
      performedBy: { name: req.user?.name || 'Staff', role: req.user?.role || 'DISTRICT_HOSPITAL' },
      timestamp: new Date().toISOString(),
    };

    this.inventoryMovements.unshift(movement);

    res.status(200).json({
      success: true,
      message: `Stock updated. Current quantity: ${nextQty} ${item.unit}`,
      data: { item, movement },
    });
  }

  getCommonStock(req, res) {
    const list = this.inventory.slice(0, 10).map((i) => ({
      _id: i._id,
      itemName: i.itemName,
      category: i.category,
      unit: i.unit,
      quantityAvailable: i.quantityAvailable,
      status: i.status,
      facilityName: i.facilityName,
    }));
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  // --- Document Handlers ---
  uploadDocument(req, res) {
    const { patientId, title, documentType, fileData, fileName, fileType, notes } = req.body;

    if (!patientId || !title || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, document title, and file data are required',
      });
    }

    const patient = this.patients.find((p) => p._id === patientId || p.id === patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const newDoc = {
      _id: 'doc_' + Date.now(),
      patientId: patient._id,
      uploadedBy: { _id: req.user?._id || DOCTOR_ID, name: req.user?.name || 'Staff', role: req.user?.role || 'DOCTOR' },
      uploaderRole: req.user?.role || 'DOCTOR',
      facilityName: req.user?.facilityName || 'Clinical Facility',
      documentType: documentType || 'PRESCRIPTION',
      title: title.trim(),
      fileName: fileName || 'Document.pdf',
      fileType: fileType || 'application/pdf',
      fileSize: 150000,
      fileData, // Encoded data URI
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    this.medicalDocuments.unshift(newDoc);
    res.status(201).json({ success: true, message: 'Medical document uploaded securely', data: newDoc });
  }

  getPatientDocuments(req, res) {
    const { patientId } = req.params;

    // Patient isolation
    if (req.user?.role === 'PATIENT' && req.user.patientId?.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Patients can only view their own health documents.',
      });
    }

    const docs = this.medicalDocuments.filter((d) => d.patientId === patientId);
    res.status(200).json({ success: true, count: docs.length, data: docs });
  }

  viewDocument(req, res) {
    const { id } = req.params;
    const doc = this.medicalDocuments.find((d) => d._id === id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Medical document not found' });
    }

    // Patient privacy isolation
    if (req.user?.role === 'PATIENT' && req.user.patientId?.toString() !== doc.patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You are not authorized to view this patient document.',
      });
    }

    res.status(200).json({ success: true, data: doc });
  }

  // --- Health Admin Handlers ---
  getHealthAdminOverview(req, res) {
    const totalPatients = this.patients.length;
    const highRiskCount = this.patients.filter((p) => p.currentRisk === 'RED').length;
    const mediumRiskCount = this.patients.filter((p) => p.currentRisk === 'YELLOW').length;
    const lowRiskCount = this.patients.filter((p) => p.currentRisk === 'GREEN').length;
    const pendingReviewCount = this.patients.filter((p) => !p.currentRisk || p.currentRisk === 'PENDING_REVIEW').length;

    const facilities = MAHARASHTRA_FACILITIES;
    const totalFacilities = facilities.length;
    const totalBeds = facilities.reduce((sum, f) => sum + (f.totalBeds || 0), 0);
    const occupiedBeds = facilities.reduce((sum, f) => sum + (f.occupiedBeds || 0), 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const totalReferrals = this.referrals.length;
    const activeReferrals = this.referrals.filter((r) => ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'].includes(r.status)).length;
    const completedReferrals = this.referrals.filter((r) => r.status === 'COMPLETED').length;

    const criticalShortages = this.inventory.filter((i) => ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'].includes(i.status)).length;

    const districts = [
      { district: 'Pune', total: 2, highRisk: 1, mediumRisk: 0, lowRisk: 1 },
      { district: 'Satara', total: 1, highRisk: 0, mediumRisk: 0, lowRisk: 1 },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        pendingReviewCount,
        totalFacilities,
        totalBeds,
        occupiedBeds,
        availableBeds,
        bedOccupancyRate,
        totalReferrals,
        activeReferrals,
        completedReferrals,
        criticalShortages,
        districts,
      },
    });
  }

  getHealthAdminFacilities(req, res) {
    const { district, type } = req.query;
    let list = [...MAHARASHTRA_FACILITIES];
    if (district) list = list.filter((f) => f.district.toLowerCase().includes(district.toLowerCase()));
    if (type) list = list.filter((f) => f.type === type);
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  getHealthAdminSurveillance(req, res) {
    const diseaseClusters = [
      {
        clusterId: 'clu_01',
        clusterName: 'Acute Respiratory Infection / Bronchitis Spike',
        syndrome: 'RESPIRATORY',
        district: 'Pune',
        subDistrict: 'Shirur',
        affectedVillages: ['Shirur', 'Saswad'],
        caseCount: 8,
        alertLevel: 'WARNING',
        status: 'MONITORED',
        detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        clusterId: 'clu_02',
        clusterName: 'Seasonal Febrile Illness Clustering',
        syndrome: 'FEVER',
        district: 'Satara',
        subDistrict: 'Koregaon',
        affectedVillages: ['Koregaon'],
        caseCount: 4,
        alertLevel: 'NORMAL',
        status: 'RESOLVED',
        detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const riskDistribution = {
      RED: this.patients.filter((p) => p.currentRisk === 'RED').length,
      YELLOW: this.patients.filter((p) => p.currentRisk === 'YELLOW').length,
      GREEN: this.patients.filter((p) => p.currentRisk === 'GREEN').length,
      PENDING_REVIEW: this.patients.filter((p) => !p.currentRisk || p.currentRisk === 'PENDING_REVIEW').length,
    };

    res.status(200).json({
      success: true,
      data: {
        diseaseClusters,
        riskDistribution,
        activeOutbreaksCount: 1,
        totalScreenedThisMonth: 124,
      },
    });
  }

  getAuditLogs(req, res) {
    const { action, role, limit = 50 } = req.query;
    let list = [...this.auditLogs];
    if (action) list = list.filter((l) => l.action === action);
    if (role) list = list.filter((l) => l.actorRole === role || l.role === role);
    res.status(200).json({ success: true, count: list.length, data: list.slice(0, Number(limit)) });
  }

  // --- Hospital Handlers ---
  getHospitalReferrals(req, res) {
    const { status, search } = req.query;
    let list = [...this.referrals];
    if (status) list = list.filter((r) => r.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.referralToken && r.referralToken.toLowerCase().includes(q)) ||
          (r.patientId?.name && r.patientId.name.toLowerCase().includes(q)) ||
          (r.department && r.department.toLowerCase().includes(q))
      );
    }
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  getReferralByToken(req, res) {
    const token = (req.params.token || '').toUpperCase().trim();
    const referral = this.referrals.find((r) => (r.referralToken || '').toUpperCase() === token);
    if (!referral) {
      return res.status(404).json({ success: false, message: `Referral token '${token}' not found` });
    }
    res.status(200).json({ success: true, data: referral });
  }

  emergencyLookupPatient(req, res) {
    const { identifier, reason, attendingDoctor, notes } = req.body;
    if (!identifier || !reason || !attendingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Emergency Break-Glass lookup requires Patient ID/Phone, Clinical Justification Reason, and Attending Doctor Name.',
      });
    }
    const clean = identifier.trim();
    const patient = this.patients.find(
      (p) => p.patientId === clean || p.phone === clean || p._id === clean
    );
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `No patient found matching ID or Phone '${clean}' in the statewide registry.`,
      });
    }

    this.auditLogs.unshift({
      _id: 'aud_' + Date.now(),
      actorUserId: req.user?._id || HOSPITAL_USER_ID,
      actorName: attendingDoctor || req.user?.name || 'Dr. Suresh Patil',
      actorRole: req.user?.role || 'DISTRICT_HOSPITAL',
      action: 'BREAK_GLASS_LOOKUP',
      resourceType: 'PATIENT',
      resourceId: patient.patientId,
      facilityId: req.user?.facilityId || 'fac_pune_dh',
      district: req.user?.assignedDistrict || 'Pune',
      status: 'SUCCESS',
      details: `Emergency break-glass lookup by Dr. ${attendingDoctor}. Justification: ${reason}. Notes: ${notes || 'None'}`,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Emergency Break-Glass access granted. Access has been logged to the immutable compliance audit trail.',
      data: patient,
    });
  }

  getHospitalEncounters(req, res) {
    const { patientId } = req.query;
    let list = [...this.hospitalEncounters];
    if (patientId) list = list.filter((e) => e.patientId === patientId);
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  createHospitalEncounter(req, res) {
    const {
      patientId,
      referralId,
      facilityName,
      encounterType = 'OUTPATIENT',
      department,
      chiefComplaint,
      diagnosis,
      treatmentSummary,
      prescriptions,
      labOrders,
      admissionDetails,
      dischargeSummary,
      isEmergencyBreakGlass,
      breakGlassReason,
    } = req.body;

    if (!patientId || !facilityName || !diagnosis || !treatmentSummary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID, facility name, diagnosis, and treatment summary.',
      });
    }

    const newEncounter = {
      _id: 'enc_' + Date.now(),
      patientId,
      referralId: referralId || null,
      facilityName,
      hospitalName: facilityName,
      encounterType,
      department: department || 'General Medicine',
      attendingDoctor: req.user?.name || 'Attending Doctor',
      attendingDoctorId: req.user?._id || HOSPITAL_USER_ID,
      chiefComplaint: chiefComplaint || '',
      diagnosis,
      treatmentSummary,
      prescriptions: prescriptions || [],
      labOrders: labOrders || [],
      admissionDetails,
      dischargeSummary,
      isEmergencyBreakGlass: !!isEmergencyBreakGlass,
      breakGlassReason: breakGlassReason || '',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    this.hospitalEncounters.unshift(newEncounter);

    if (referralId) {
      const ref = this.referrals.find((r) => r._id === referralId);
      if (ref) {
        ref.status = 'COMPLETED';
        ref.statusHistory = ref.statusHistory || [];
        ref.statusHistory.push({
          status: 'COMPLETED',
          updatedBy: req.user?._id || HOSPITAL_USER_ID,
          note: `Treatment completed at ${facilityName}: ${diagnosis}`,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Hospital clinical encounter recorded successfully',
      data: newEncounter,
    });
  }

  getBeds(req, res) {
    const { ward, status } = req.query;
    let list = [...this.beds];
    if (ward) list = list.filter((b) => b.ward === ward);
    if (status) list = list.filter((b) => b.status === status);
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  updateBedStatus(req, res) {
    const { id } = req.params;
    const { status, patientId, notes } = req.body;
    const bed = this.beds.find((b) => b._id === id || b.id === id);
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    if (status) bed.status = status;
    if (notes !== undefined) bed.notes = notes;
    if (status === 'OCCUPIED' && patientId) {
      bed.patientId = patientId;
      bed.assignedAt = new Date().toISOString();
      const p = this.patients.find((pt) => pt._id === patientId);
      if (p) bed.patientName = p.name;
    } else if (status === 'AVAILABLE' || status === 'MAINTENANCE') {
      bed.patientId = null;
      bed.patientName = '';
      bed.assignedAt = null;
    }
    res.status(200).json({ success: true, message: `Bed status updated to ${bed.status}`, data: bed });
  }

  // --- Inventory Handlers ---
  createInventoryMovement(req, res) {
    const {
      itemId,
      movementType,
      quantity,
      referenceNumber,
      notes,
    } = req.body;

    const item = this.inventory.find((i) => i._id === itemId || i.id === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required.' });
    }

    const balanceBefore = item.quantityAvailable;
    let balanceAfter = balanceBefore;

    if (movementType === 'INWARD' || movementType === 'TRANSFER_IN' || movementType === 'ADD') {
      balanceAfter += qty;
    } else {
      if (balanceBefore < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${balanceBefore}, requested: ${qty}`,
        });
      }
      balanceAfter -= qty;
    }

    item.quantityAvailable = balanceAfter;
    if (balanceAfter <= 0) item.status = 'OUT_OF_STOCK';
    else if (balanceAfter <= item.minimumStockLevel) item.status = 'LOW_STOCK';
    else item.status = 'IN_STOCK';

    const movement = {
      _id: 'mov_' + Date.now(),
      itemId: item._id,
      itemName: item.itemName,
      batchNumber: item.batchNumber,
      movementType,
      quantity: qty,
      balanceBefore,
      balanceAfter,
      referenceNumber: referenceNumber || `REF-${Date.now()}`,
      notes: notes || '',
      performedBy: { name: req.user?.name || 'Staff', role: req.user?.role || 'DISTRICT_HOSPITAL' },
      timestamp: new Date().toISOString(),
    };

    this.inventoryMovements.unshift(movement);

    res.status(201).json({
      success: true,
      message: `Stock movement recorded. New quantity for '${item.itemName}': ${balanceAfter} ${item.unit}`,
      data: { item, movement },
    });
  }

  // --- Facility Handlers ---
  getAllFacilities(req, res) {
    const { district, type, search } = req.query;
    let list = [...MAHARASHTRA_FACILITIES];
    if (district) list = list.filter((f) => f.district.toLowerCase().includes(district.toLowerCase()));
    if (type) list = list.filter((f) => f.type === type);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || f.district.toLowerCase().includes(q));
    }
    res.status(200).json({ success: true, count: list.length, data: list });
  }

  async getNearbyFacilities(req, res) {
    const { getNearbyFacilities: getNearbyFromProvider } = require('./facilityProvider');
    const { lat, lng, district, maxDistance } = req.query;
    let facilities = await getNearbyFromProvider({
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      district: district || 'Pune',
      maxDistanceKm: maxDistance ? parseFloat(maxDistance) : 60,
    });
    if (lat && lng) {
      facilities.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }
    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  }
}

const mockStore = new MockStore();
module.exports = mockStore;
