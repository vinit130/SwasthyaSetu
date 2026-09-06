const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Followup = require('../models/Followup');

// @desc    Get consultations for a patient
// @route   GET /api/patients/:id/consultations
// @access  Private
exports.getConsultationsByPatient = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ patientId: req.params.id })
      .populate('doctorId', 'name role')
      .populate('visitId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor consultation
// @route   POST /api/patients/:id/consultations
// @access  Private (DOCTOR ONLY)
exports.createConsultation = async (req, res, next) => {
  try {
    const {
      visitId,
      observations,
      assessment,
      advice,
      treatmentInstructions,
      followUpDate,
    } = req.body;

    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    if (!observations || !assessment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor clinical observations and assessment are required',
      });
    }

    const consultation = new Consultation({
      patientId,
      doctorId: req.user._id,
      visitId: visitId || null,
      observations,
      assessment,
      advice: advice || '',
      treatmentInstructions: treatmentInstructions || '',
      followUpDate: followUpDate || null,
      createdAt: new Date(),
    });

    const savedConsultation = await consultation.save();

    // If a visit was linked, update its status
    if (visitId) {
      await Visit.findByIdAndUpdate(visitId, { status: 'CONSULTED' });
    }

    // If follow-up date was scheduled during consultation, create follow-up record
    let createdFollowup = null;
    if (followUpDate) {
      createdFollowup = new Followup({
        patientId,
        doctorId: req.user._id,
        date: new Date(followUpDate),
        instructions: advice || treatmentInstructions || 'Follow-up clinical assessment',
        status: 'PENDING',
      });
      await createdFollowup.save();
    }

    res.status(201).json({
      success: true,
      message: 'Consultation record saved successfully',
      data: savedConsultation,
      followup: createdFollowup,
    });
  } catch (error) {
    next(error);
  }
};
