const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const { assessRisk } = require('../utils/riskEngine');

// @desc    Get all visits for a patient
// @route   GET /api/patients/:id/visits
// @access  Private
exports.getVisitsByPatient = async (req, res, next) => {
  try {
    const visits = await Visit.find({ patientId: req.params.id })
      .populate('recordedBy', 'name role')
      .populate('assessedBy', 'name role')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new visit (symptoms & vitals) with suggested risk indicators
// @route   POST /api/patients/:id/visits
// @access  Private
exports.createVisit = async (req, res, next) => {
  try {
    const { symptoms, vitals, notes } = req.body;
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    // Run deterministic rule-based triage assessment as suggested clinical indicator
    const suggestedIndicators = assessRisk({ symptoms, vitals });

    // If recorded by doctor, can directly assign riskLevel; if ASHA, it stays PENDING_REVIEW
    const isDoctor = req.user.role === 'DOCTOR';
    const riskLevel = isDoctor ? suggestedIndicators.level : 'PENDING_REVIEW';

    const visit = new Visit({
      patientId,
      recordedBy: req.user._id,
      symptoms: symptoms || [],
      vitals: vitals || {},
      suggestedRisk: suggestedIndicators.level,
      suggestedRiskReasons: suggestedIndicators.reasons,
      riskLevel,
      riskReasons: suggestedIndicators.reasons,
      status: isDoctor ? 'REVIEWED' : 'PENDING_REVIEW',
      assessedBy: isDoctor ? req.user._id : undefined,
      assessedAt: isDoctor ? new Date() : undefined,
      notes: notes || '',
      visitDate: new Date(),
    });

    const savedVisit = await visit.save();

    // Update patient currentRisk
    patient.currentRisk = riskLevel;
    if (isDoctor) {
      patient.riskAssessedBy = req.user._id;
      patient.riskAssessedAt = new Date();
    }
    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Symptoms & vitals saved. Case forwarded for doctor clinical review.',
      suggestedRiskIndicators: suggestedIndicators,
      data: savedVisit,
    });
  } catch (error) {
    next(error);
  }
};
