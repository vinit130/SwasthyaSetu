const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const Referral = require('../models/Referral');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const HospitalEncounter = require('../models/HospitalEncounter');
const Facility = require('../models/Facility');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get hospital inbound referrals
// @route   GET /api/hospital/referrals
// @access  Private (DISTRICT_HOSPITAL, HEALTH_DEPARTMENT_ADMIN)
exports.getReferrals = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getHospitalReferrals(req, res);
  }
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let referrals = await Referral.find(filter)
      .populate('patientId', 'name patientId age gender phone village district bloodGroup currentRisk')
      .populate('doctorId', 'name role phone')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      referrals = referrals.filter((r) =>
        (r.referralToken && r.referralToken.toLowerCase().includes(q)) ||
        (r.patientId && r.patientId.name.toLowerCase().includes(q)) ||
        (r.patientId && r.patientId.phone.includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    console.error('Error fetching hospital referrals:', error);
    return mockStore.getHospitalReferrals(req, res);
  }
};

// @desc    Lookup referral by unique referral token (e.g. SS-REF-2026-XXXXXX)
// @route   GET /api/hospital/referral-token/:token
// @access  Private (DISTRICT_HOSPITAL, DOCTOR, HEALTH_DEPARTMENT_ADMIN)
exports.getReferralByToken = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getReferralByToken(req, res);
  }
  try {
    const token = req.params.token.toUpperCase().trim();
    const referral = await Referral.findOne({ referralToken: token })
      .populate('patientId')
      .populate('doctorId', 'name role phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: `Referral token '${token}' was not found. Please verify the slip or try Emergency Lookup.`,
      });
    }

    // Log access
    await logAudit({
      userId: req.user._id || req.user.id,
      patientId: referral.patientId?._id,
      action: 'VIEW_REFERRAL_BY_TOKEN',
      role: req.user.role,
      details: `Lookup token ${token} by ${req.user.name}`,
    });

    res.status(200).json({
      success: true,
      data: referral,
    });
  } catch (error) {
    console.error('Error in referral token lookup:', error);
    return mockStore.getReferralByToken(req, res);
  }
};

// @desc    Emergency "Break-Glass" Direct Patient Lookup
// @route   POST /api/hospital/emergency-lookup
// @access  Private (DISTRICT_HOSPITAL)
exports.emergencyLookup = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.emergencyLookupPatient(req, res);
  }
  try {
    const { identifier, reason, attendingDoctor, notes } = req.body;

    if (!identifier || !reason || !attendingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Emergency Break-Glass lookup requires Patient ID/Phone, Clinical Justification Reason, and Attending Doctor Name.',
      });
    }

    const clean = identifier.trim();
    const patient = await Patient.findOne({
      $or: [
        { patientId: new RegExp(`^${clean}$`, 'i') },
        { phone: clean },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `No patient found matching ID or Phone '${clean}' in the statewide registry.`,
      });
    }

    // MANDATORY BREAK-GLASS AUDIT LOGGING
    await logAudit({
      userId: req.user._id || req.user.id,
      patientId: patient._id,
      action: 'BREAK_GLASS_LOOKUP',
      role: req.user.role,
      reason,
      details: `Emergency break-glass lookup by Dr. ${attendingDoctor}. Justification: ${reason}. Notes: ${notes || 'None'}`,
    });

    res.status(200).json({
      success: true,
      message: 'Emergency Break-Glass access granted. Access has been logged to the immutable compliance audit trail.',
      data: patient,
    });
  } catch (error) {
    console.error('Error in emergency lookup:', error);
    return mockStore.emergencyLookupPatient(req, res);
  }
};

// @desc    Get hospital encounters for patient or hospital
// @route   GET /api/hospital/encounters
// @access  Private (DISTRICT_HOSPITAL, DOCTOR, HEALTH_DEPARTMENT_ADMIN)
exports.getEncounters = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getHospitalEncounters(req, res);
  }
  try {
    const { patientId } = req.query;
    const filter = {};
    if (patientId) filter.patientId = patientId;

    const encounters = await HospitalEncounter.find(filter)
      .populate('patientId', 'name patientId age gender phone')
      .populate('attendingDoctorId', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: encounters.length,
      data: encounters,
    });
  } catch (error) {
    console.error('Error fetching encounters:', error);
    return mockStore.getHospitalEncounters(req, res);
  }
};

// @desc    Record new hospital encounter (OPD visit, Admission, Clinical treatment, Discharge)
// @route   POST /api/hospital/encounters
// @access  Private (DISTRICT_HOSPITAL)
exports.createEncounter = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.createHospitalEncounter(req, res);
  }
  try {
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

    const encounter = new HospitalEncounter({
      patientId,
      referralId: referralId || null,
      facilityName,
      encounterType,
      department: department || 'General Medicine',
      attendingDoctorId: req.user._id || req.user.id,
      chiefComplaint: chiefComplaint || '',
      diagnosis,
      treatmentSummary,
      prescriptions: prescriptions || [],
      labOrders: labOrders || [],
      admissionDetails,
      dischargeSummary,
      isEmergencyBreakGlass: !!isEmergencyBreakGlass,
      breakGlassReason: breakGlassReason || '',
    });

    const saved = await encounter.save();

    // If referral exists, update status to COMPLETED or PATIENT ARRIVED
    if (referralId) {
      const referral = await Referral.findById(referralId);
      if (referral) {
        referral.status = 'COMPLETED';
        referral.statusHistory.push({
          status: 'COMPLETED',
          updatedBy: req.user._id || req.user.id,
          note: `Treatment recorded at ${facilityName} (${diagnosis})`,
          updatedAt: new Date(),
        });
        await referral.save();
      }
    }

    // Log audit
    await logAudit({
      userId: req.user._id || req.user.id,
      patientId,
      action: 'RECORD_HOSPITAL_TREATMENT',
      role: req.user.role,
      details: `${encounterType} encounter recorded at ${facilityName}: ${diagnosis}`,
    });

    res.status(201).json({
      success: true,
      message: 'Hospital clinical encounter recorded successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error creating hospital encounter:', error);
    return mockStore.createHospitalEncounter(req, res);
  }
};

// @desc    Get hospital ward beds
// @route   GET /api/hospital/beds
// @access  Private (DISTRICT_HOSPITAL, HEALTH_DEPARTMENT_ADMIN, DOCTOR)
exports.getBeds = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getBeds(req, res);
  }
  try {
    const { ward, status } = req.query;
    const filter = {};
    if (ward) filter.ward = ward;
    if (status) filter.status = status;

    const beds = await Bed.find(filter)
      .populate('patientId', 'name patientId age gender')
      .sort({ ward: 1, bedNumber: 1 });

    res.status(200).json({
      success: true,
      count: beds.length,
      data: beds,
    });
  } catch (error) {
    console.error('Error fetching beds:', error);
    return mockStore.getBeds(req, res);
  }
};

// @desc    Update bed status & assign/release patient
// @route   PUT /api/hospital/beds/:id
// @access  Private (DISTRICT_HOSPITAL)
exports.updateBed = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.updateBedStatus(req, res);
  }
  try {
    const { status, patientId, notes } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: 'Bed not found',
      });
    }

    if (status) bed.status = status;
    if (notes !== undefined) bed.notes = notes;

    if (status === 'OCCUPIED' && patientId) {
      bed.patientId = patientId;
      bed.assignedAt = new Date();
    } else if (status === 'AVAILABLE' || status === 'MAINTENANCE') {
      bed.patientId = null;
      bed.assignedAt = null;
    }

    await bed.save();

    res.status(200).json({
      success: true,
      message: `Bed ${bed.bedNumber} status updated to ${bed.status}`,
      data: bed,
    });
  } catch (error) {
    console.error('Error updating bed:', error);
    return mockStore.updateBedStatus(req, res);
  }
};
