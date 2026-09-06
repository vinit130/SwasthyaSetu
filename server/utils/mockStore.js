const bcrypt = require('bcryptjs');
const { assessRisk } = require('./riskEngine');

// Demo User IDs
const ASHA_ID = '66d000000000000000000001';
const DOCTOR_ID = '66d000000000000000000002';
const PATIENT_USER_ID = '66d000000000000000000003';

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
    ];

    this.patients = [
      {
        _id: RAHUL_ID,
        id: RAHUL_ID,
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
        address: 'Near Primary School',
        village: 'Rampur',
        district: 'Demo District',
        state: 'West Bengal',
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
        village: 'Demo Village',
        district: 'Demo District',
        state: 'West Bengal',
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
        patientId: {
          _id: RAHUL_ID,
          patientId: 'SS-2026-0001',
          name: 'Rahul Kumar',
          phone: '9876500001',
          age: 35,
          gender: 'Male',
          village: 'Demo Village',
          district: 'Demo District',
        },
        doctorId: {
          _id: DOCTOR_ID,
          name: 'Dr. Ananya Sharma',
          role: 'DOCTOR',
          phone: '9876543211',
        },
        reason: 'Persistent fever requiring complete blood count & malaria/dengue profile tests',
        facility: 'District Hospital',
        department: 'General Medicine & Pathology',
        priority: 'ROUTINE',
        instructions: 'Fasting blood draw for CBC, Dengue NS1 & MP by card test.',
        status: 'COMPLETED',
        statusHistory: [
          { status: 'CREATED', updatedBy: { name: 'Dr. Ananya Sharma', role: 'DOCTOR' }, note: 'Referral initiated by doctor', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'ACCEPTED', updatedBy: { name: 'Dr. Ananya Sharma', role: 'DOCTOR' }, note: 'Accepted at District Hospital', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'PATIENT ARRIVED', updatedBy: { name: 'Sunita Devi (ASHA)', role: 'ASHA' }, note: 'Patient arrived with ASHA escort', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { status: 'COMPLETED', updatedBy: { name: 'Dr. Ananya Sharma', role: 'DOCTOR' }, note: 'Investigations completed. Routine viral confirmed.', updatedAt: new Date().toISOString() },
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
          village: 'Demo Village',
          district: 'Demo District',
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
          village: 'Demo Village',
          district: 'Demo District',
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
  }

  // --- Auth Helpers ---
  authenticateUser(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const isDemoPassword = password === 'Demo@123';

    if (!isDemoPassword) return null;

    const user = this.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    );

    return user || null;
  }

  findUserById(id) {
    return this.users.find((u) => u._id === id || u.id === id) || null;
  }

  // --- Patient Handlers ---
  getPatients(req, res) {
    const { search, risk, village } = req.query;
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
    const patient = this.patients.find((p) => p._id === req.params.id);
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

    // Build timeline
    const timeline = [];
    timeline.push({
      type: 'REGISTRATION',
      date: patient.createdAt,
      title: 'Patient Registered',
      description: `Registered by ${patient.createdBy?.name || 'Frontline Worker'} at ${patient.village}, ${patient.district}`,
      badge: 'Completed',
      badgeColor: 'teal',
      data: patient,
    });

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

    referrals.forEach((r) => {
      timeline.push({
        type: 'REFERRAL',
        date: r.createdAt,
        title: `Hospital Referral: ${r.facility}`,
        description: `Department: ${r.department} | Priority: ${r.priority} | Status: ${r.status}`,
        badge: r.status,
        badgeColor: r.status === 'COMPLETED' ? 'green' : 'purple',
        data: r,
      });
    });

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

    const newId = `66d0000000000000000000${(this.patients.length + 10).toString(16).padStart(2, '0')}`;
    const seq = (this.patients.length + 1).toString().padStart(4, '0');
    const patientId = `SS-2026-${seq}`;

    const newPatient = {
      _id: newId,
      id: newId,
      patientId,
      name: name.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      address: address || '',
      village: village.trim(),
      district: district ? district.trim() : 'Demo District',
      state: state || 'West Bengal',
      emergencyContact: emergencyContact || '',
      bloodGroup: bloodGroup || 'Unknown',
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      existingConditions: Array.isArray(existingConditions) ? existingConditions : existingConditions ? [existingConditions] : [],
      currentRisk: 'PENDING_REVIEW',
      createdBy: { _id: req.user._id, name: req.user.name, role: req.user.role },
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
    };
    this.users.push(patientUser);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient,
      credentials: {
        label: 'Patient Login Credentials — Demo',
        patientId: newPatient.patientId,
        username,
        tempPassword,
        temporaryPassword: tempPassword,
        name: newPatient.name,
        role: 'PATIENT',
      },
      userCredentials: {
        label: 'Patient Login Credentials — Demo',
        patientId: newPatient.patientId,
        username,
        tempPassword,
        temporaryPassword: tempPassword,
        name: newPatient.name,
        role: 'PATIENT',
      },
    });
  }

  updatePatient(req, res) {
    const patient = this.patients.find((p) => p._id === req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }
    Object.assign(patient, req.body);
    res.status(200).json({ success: true, message: 'Patient profile updated successfully', data: patient });
  }

  checkDuplicate(req, res) {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(200).json({ isDuplicate: false });

    const existing = this.patients.find(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase() && p.phone === phone.trim()
    );

    if (existing) {
      return res.status(200).json({
        isDuplicate: true,
        patient: existing,
        message: `Possible existing patient found: '${existing.name}' (${existing.patientId}) with matching phone and age in ${existing.village}.`,
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
    patient.riskAssessedBy = { _id: req.user._id, name: req.user.name, role: 'DOCTOR' };
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
      visit.assessedBy = { _id: req.user._id, name: req.user.name, role: 'DOCTOR' };
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
    const patient = this.patients.find((p) => p._id === req.user.patientId || p._id === RAHUL_ID);
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

    const followups = this.followups
      .filter((f) => (f.patientId?._id || f.patientId) === patient._id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const journeySteps = [
      {
        step: 1,
        title: 'Patient Registered',
        date: patient.createdAt,
        status: 'COMPLETED',
        description: `Enrolled in village healthcare registry at ${patient.village}.`,
      },
    ];

    if (latestVisit) {
      journeySteps.push({
        step: 2,
        title: 'Symptoms & Vitals Recorded',
        date: latestVisit.visitDate,
        status: 'COMPLETED',
        description: `Frontline vitals captured (Temp: ${latestVisit.vitals?.temperature ? latestVisit.vitals.temperature + '°C' : 'Normal'}, SpO2: ${latestVisit.vitals?.spO2 ? latestVisit.vitals.spO2 + '%' : 'Normal'}).`,
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
        description: `${r.department} • Priority: ${r.priority} • Status: ${r.status}`,
      });
    }

    if (followups.length > 0) {
      const nextFollowup = followups.find((f) => f.status === 'PENDING') || followups[followups.length - 1];
      journeySteps.push({
        step: 6,
        title: `Follow-up Visit (${nextFollowup.status})`,
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
    const isDoctor = req.user.role === 'DOCTOR';
    const riskLevel = isDoctor ? suggestedIndicators.level : 'PENDING_REVIEW';

    const newVisit = {
      _id: `66d0000000000000000000${(this.visits.length + 30).toString(16).padStart(2, '0')}`,
      patientId,
      recordedBy: { _id: req.user._id, name: req.user.name, role: req.user.role },
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
      doctorId: { _id: req.user._id, name: req.user.name, role: req.user.role },
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
        doctorId: { _id: req.user._id, name: req.user.name, role: req.user.role },
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
          r.department?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({ success: true, count: list.length, data: list });
  }

  getReferralById(req, res) {
    const referral = this.referrals.find((r) => r._id === req.params.id);
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }
    res.status(200).json({ success: true, data: referral });
  }

  createReferral(req, res) {
    const { patientId, reason, facility, department, priority = 'ROUTINE', instructions } = req.body;
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

    const newReferral = {
      _id: `66d0000000000000000000${(this.referrals.length + 50).toString(16).padStart(2, '0')}`,
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
      doctorId: { _id: req.user._id, name: req.user.name, role: req.user.role },
      reason,
      facility,
      department,
      priority: priority.toUpperCase(),
      instructions: instructions || '',
      status: 'CREATED',
      statusHistory: [
        {
          status: 'CREATED',
          updatedBy: { name: req.user.name, role: req.user.role },
          note: 'Referral initiated by doctor',
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    this.referrals.unshift(newReferral);
    res.status(201).json({ success: true, message: 'Patient referral created successfully', data: newReferral });
  }

  updateReferralStatus(req, res) {
    const { status, note } = req.body;
    const referral = this.referrals.find((r) => r._id === req.params.id);

    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found' });
    }

    referral.status = status;
    referral.statusHistory.push({
      status,
      updatedBy: { name: req.user.name, role: req.user.role },
      note: note || `Referral status updated to ${status} by ${req.user.name} (${req.user.role})`,
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
      doctorId: { _id: req.user._id, name: req.user.name, role: req.user.role },
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
        followup.completedBy = { _id: req.user._id, name: req.user.name, role: req.user.role };
      }
    }

    if (notes !== undefined) {
      followup.notes = notes;
    }

    res.status(200).json({ success: true, message: `Follow-up marked as ${followup.status}`, data: followup });
  }

  // --- Dashboard Handlers ---
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
          patientId: patient || { name: 'Unknown', patientId: 'SS-0000', age: 30, gender: 'Unknown', village: 'Demo Village' },
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
        patientId: patient || { name: 'Rahul Kumar', patientId: 'SS-2026-0001', age: 35, gender: 'Male', village: 'Demo Village' },
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
}

const mockStore = new MockStore();
module.exports = mockStore;
