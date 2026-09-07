const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Consultation = require('../models/Consultation');
const Referral = require('../models/Referral');
const Followup = require('../models/Followup');
const HospitalEncounter = require('../models/HospitalEncounter');
const MedicalDocument = require('../models/MedicalDocument');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { validateIndianPhone } = require('../utils/validators');

// @desc    Get all patients with search & risk filter
// @route   GET /api/patients
// @access  Private (ASHA & DOCTOR)
exports.getPatients = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getPatients(req, res);
  }
  try {
    const { search, risk, village, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { village: searchRegex },
      ];
    }

    if (village) {
      query.village = new RegExp(village.trim(), 'i');
    }

    const patients = await Patient.find(query)
      .populate('createdBy', 'name role')
      .populate('riskAssessedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Patient.countDocuments(query);

    // Fetch latest visit and pending follow-ups for each patient
    const patientIds = patients.map((p) => p._id);

    const latestVisits = await Visit.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { visitDate: -1 } },
      {
        $group: {
          _id: '$patientId',
          latestVisit: { $first: '$$ROOT' },
        },
      },
    ]);

    const visitMap = {};
    latestVisits.forEach((v) => {
      visitMap[v._id.toString()] = v.latestVisit;
    });

    // Check pending follow-ups
    const pendingFollowups = await Followup.find({
      patientId: { $in: patientIds },
      status: 'PENDING',
    }).lean();

    const followupMap = {};
    pendingFollowups.forEach((f) => {
      followupMap[f.patientId.toString()] = f;
    });

    const enrichedPatients = patients
      .map((patient) => {
        const lastVisit = visitMap[patient._id.toString()] || null;
        const pendingFollowup = followupMap[patient._id.toString()] || null;
        // Authoritative doctor risk from patient.currentRisk or fallback to lastVisit
        const authoritativeRisk =
          patient.currentRisk && patient.currentRisk !== 'PENDING_REVIEW'
            ? patient.currentRisk
            : lastVisit?.riskLevel && lastVisit.riskLevel !== 'PENDING_REVIEW'
            ? lastVisit.riskLevel
            : 'PENDING_REVIEW';

        return {
          ...patient,
          latestVisit: lastVisit,
          currentRisk: authoritativeRisk,
          suggestedRisk: lastVisit?.suggestedRisk || 'GREEN',
          pendingFollowup,
        };
      })
      .filter((patient) => {
        if (!risk) return true;
        return patient.currentRisk === risk.toUpperCase();
      });

    res.status(200).json({
      success: true,
      count: enrichedPatients.length,
      total,
      data: enrichedPatients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check for duplicate patient before creation
// @route   POST /api/patients/check-duplicate
// @access  Private
exports.checkDuplicate = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.checkDuplicate(req, res);
  }
  try {
    const { name, phone, age } = req.body;

    if (!name || !phone) {
      return res.status(200).json({ isDuplicate: false });
    }

    const query = {
      name: new RegExp(`^${name.trim()}$`, 'i'),
      phone: phone.trim(),
    };

    if (age !== undefined && age !== '') {
      query.age = Number(age);
    }

    const existing = await Patient.findOne(query).select('name patientId phone age village');
    if (existing) {
      return res.status(200).json({
        isDuplicate: true,
        patient: existing,
        message: `Possible existing patient found: '${existing.name}' (${existing.patientId}) with matching phone and age in ${existing.village}.`,
      });
    }

    res.status(200).json({ isDuplicate: false });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient & auto-generate secure login credentials
// @route   POST /api/patients
// @access  Private (ASHA & DOCTOR)
exports.createPatient = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.createPatient(req, res);
  }
  try {
    const {
      name,
      dateOfBirth,
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
      allowDuplicate = false,
    } = req.body;

    if (!phone || !validateIndianPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    // Check duplicate unless explicitly confirmed by ASHA
    const duplicateQuery = {
      name: new RegExp(`^${name.trim()}$`, 'i'),
      phone: phone.trim(),
    };
    if (age) duplicateQuery.age = Number(age);

    const duplicate = await Patient.findOne(duplicateQuery);
    if (duplicate && !allowDuplicate) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: `Possible existing patient found: '${duplicate.name}' with phone '${phone}' and age '${duplicate.age}' (${duplicate.patientId}).`,
        existingPatient: duplicate,
      });
    }

    const patient = new Patient({
      name: name.trim(),
      dateOfBirth,
      age: Number(age),
      gender,
      phone: phone.trim(),
      address: address || '',
      village: village.trim(),
      district: district.trim(),
      state: state || 'Maharashtra',
      emergencyContact: emergencyContact || '',
      bloodGroup: bloodGroup || 'Unknown',
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      existingConditions: Array.isArray(existingConditions)
        ? existingConditions
        : existingConditions
        ? [existingConditions]
        : [],
      currentRisk: 'PENDING_REVIEW',
      createdBy: req.user._id,
    });

    const savedPatient = await patient.save();

    // Auto-generate secure patient login account
    const cleanSeq = savedPatient.patientId.replace(/[^0-9]/g, '');
    const username = `patient${cleanSeq}`;
    const tempPassword = `Patient@${Math.floor(1000 + Math.random() * 9000)}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const patientUser = await User.create({
      name: savedPatient.name,
      username: username,
      email: `${username}@patient.swasthyasetu.org`,
      passwordHash,
      role: 'PATIENT',
      patientId: savedPatient._id,
      phone: savedPatient.phone,
      language: 'en',
    });

    savedPatient.userAccountId = patientUser._id;
    await savedPatient.save();

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: savedPatient,
      credentials: {
        label: 'Patient Login Credentials — Demo',
        patientId: savedPatient.patientId,
        username,
        tempPassword,
        temporaryPassword: tempPassword,
        name: savedPatient.name,
        role: 'PATIENT',
      },
      userCredentials: {
        label: 'Patient Login Credentials — Demo',
        patientId: savedPatient.patientId,
        username,
        tempPassword,
        temporaryPassword: tempPassword,
        name: savedPatient.name,
        role: 'PATIENT',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient profile & complete journey timeline
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getPatientById(req, res);
  }
  try {
    // Enforce patient data isolation
    if (req.user.role === 'PATIENT' && req.user.patientId?.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Patients can only access their own health records.',
      });
    }

    const patient = await Patient.findById(req.params.id)
      .populate('createdBy', 'name role phone')
      .populate('riskAssessedBy', 'name role');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    // Fetch visits, consultations, referrals, follow-ups
    const visits = await Visit.find({ patientId: patient._id })
      .populate('recordedBy', 'name role')
      .populate('assessedBy', 'name role')
      .sort({ visitDate: -1 });

    const consultations = await Consultation.find({ patientId: patient._id })
      .populate('doctorId', 'name role')
      .sort({ createdAt: -1 });

    const referrals = await Referral.find({ patientId: patient._id })
      .populate('doctorId', 'name role')
      .sort({ createdAt: -1 });

    const followups = await Followup.find({ patientId: patient._id })
      .populate('doctorId', 'name role')
      .populate('completedBy', 'name role')
      .sort({ date: -1 });

    const encounters = await HospitalEncounter.find({ patientId: patient._id })
      .populate('attendingDoctorId', 'name role')
      .sort({ createdAt: -1 });

    const documents = await MedicalDocument.find({ patientId: patient._id })
      .populate('uploadedBy', 'name role')
      .select('-fileData')
      .sort({ createdAt: -1 });

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

    // Visit events
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

    // Doctor Risk Assessment Event (if confirmed)
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

    // Consultation events
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

    // Referral events
    referrals.forEach((r) => {
      timeline.push({
        type: 'REFERRAL',
        date: r.createdAt,
        title: `Hospital Referral: ${r.facility}`,
        description: `Department: ${r.department} | Priority: ${r.priority} | Status: ${r.status}${r.referralToken ? ` | Token: ${r.referralToken}` : ''}`,
        badge: r.status,
        badgeColor: r.status === 'COMPLETED' ? 'green' : 'purple',
        data: r,
      });
    });

    // Hospital Encounter events
    encounters.forEach((e) => {
      timeline.push({
        type: 'HOSPITAL_ENCOUNTER',
        date: e.createdAt,
        title: `Hospital Care: ${e.encounterType} (${e.facilityName})`,
        description: `Diagnosis: ${e.diagnosis}. Treatment: ${e.treatmentSummary}`,
        badge: e.encounterType,
        badgeColor: 'indigo',
        data: e,
      });
    });

    // Medical Document events
    documents.forEach((d) => {
      timeline.push({
        type: 'MEDICAL_DOCUMENT',
        date: d.createdAt,
        title: `Document: ${d.title}`,
        description: `Type: ${d.documentType} | Facility: ${d.facilityName || 'SwasthyaSetu'} | Uploaded by: ${d.uploadedBy?.name || 'Staff'}`,
        badge: d.documentType,
        badgeColor: 'teal',
        data: d,
      });
    });

    // Follow-up events
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

    // Sort timeline descending by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    const latestVisit = visits[0] || null;
    const currentRisk =
      patient.currentRisk && patient.currentRisk !== 'PENDING_REVIEW'
        ? patient.currentRisk
        : latestVisit?.riskLevel && latestVisit.riskLevel !== 'PENDING_REVIEW'
        ? latestVisit.riskLevel
        : 'PENDING_REVIEW';

    res.status(200).json({
      success: true,
      data: {
        patient,
        currentRisk,
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
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor confirms authoritative clinical risk assessment
// @route   POST /api/patients/:id/risk-assessment
// @access  Private (DOCTOR ONLY)
exports.assessRiskByDoctor = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.assessRiskByDoctor(req, res);
  }
  try {
    const { riskLevel, riskReason, reason, visitId } = req.body;
    const finalReason = riskReason || reason || '';
    const allowed = ['GREEN', 'YELLOW', 'RED'];

    if (!allowed.includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid risk level. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    // Set authoritative doctor-confirmed risk on patient
    patient.currentRisk = riskLevel;
    patient.riskNote = finalReason;
    patient.riskAssessedBy = req.user._id;
    patient.riskAssessedAt = new Date();
    await patient.save();

    // Link and update visit
    let visit = null;
    if (visitId) {
      visit = await Visit.findById(visitId);
    } else {
      visit = await Visit.findOne({ patientId: patient._id }).sort({ visitDate: -1 });
    }

    if (visit) {
      visit.riskLevel = riskLevel;
      visit.doctorRiskNote = finalReason;
      visit.assessedBy = req.user._id;
      visit.assessedAt = new Date();
      visit.status = 'REVIEWED';
      await visit.save();
    }

    await patient.populate('riskAssessedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Authoritative clinical risk assessment confirmed as ${riskLevel} by doctor`,
      currentRisk: patient.currentRisk,
      riskNote: patient.riskNote,
      data: {
        patient,
        visit,
        currentRisk: patient.currentRisk,
        riskNote: patient.riskNote,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get authenticated patient's own care journey
// @route   GET /api/patients/me/journey
// @access  Private (PATIENT ONLY)
exports.getPatientJourney = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getPatientJourney(req, res);
  }
  try {
    if (req.user.role !== 'PATIENT' || !req.user.patientId) {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is accessible only by authenticated patient accounts.',
      });
    }

    const patient = await Patient.findById(req.user.patientId)
      .select('name patientId age gender village district bloodGroup allergies existingConditions currentRisk riskNote riskAssessedAt createdAt');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    const latestVisit = await Visit.findOne({ patientId: patient._id })
      .select('symptoms vitals riskLevel visitDate doctorRiskNote')
      .sort({ visitDate: -1 });

    const consultations = await Consultation.find({ patientId: patient._id })
      .select('observations assessment advice treatmentInstructions followUpDate createdAt')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    const referrals = await Referral.find({ patientId: patient._id })
      .select('facility department priority reason instructions status createdAt updatedAt')
      .sort({ createdAt: -1 });

    const followups = await Followup.find({ patientId: patient._id })
      .select('date instructions status notes completedAt')
      .sort({ date: 1 });

    // Clean simplified journey steps for patient view
    const journeySteps = [];

    // Step 1: Registered
    journeySteps.push({
      step: 1,
      title: 'Patient Registered',
      date: patient.createdAt,
      status: 'COMPLETED',
      description: `Enrolled in village healthcare registry at ${patient.village}.`,
    });

    // Step 2: Screening
    if (latestVisit) {
      journeySteps.push({
        step: 2,
        title: 'Symptoms & Vitals Recorded',
        date: latestVisit.visitDate,
        status: 'COMPLETED',
        description: `Frontline vitals captured (Temp: ${latestVisit.vitals?.temperature ? latestVisit.vitals.temperature + '°C' : 'Normal'}, SpO2: ${latestVisit.vitals?.spO2 ? latestVisit.vitals.spO2 + '%' : 'Normal'}).`,
      });
    }

    // Step 3: Doctor Review & Risk Assessment
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

    // Step 4: Consultation & Treatment
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

    // Step 5: Referral (if any)
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

    // Step 6: Follow-up
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
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (ASHA & DOCTOR)
exports.updatePatient = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.updatePatient(req, res);
  }
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};
