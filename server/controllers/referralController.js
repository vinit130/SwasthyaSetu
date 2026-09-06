const Referral = require('../models/Referral');
const Patient = require('../models/Patient');

// @desc    Get all referrals with filter
// @route   GET /api/referrals
// @access  Private (ASHA & DOCTOR)
exports.getReferrals = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }
    if (priority) {
      query.priority = priority.toUpperCase();
    }

    let referrals = await Referral.find(query)
      .populate('patientId', 'name patientId phone age gender village district')
      .populate('doctorId', 'name role phone')
      .sort({ createdAt: -1 });

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      referrals = referrals.filter(
        (r) =>
          (r.patientId && searchRegex.test(r.patientId.name)) ||
          (r.patientId && searchRegex.test(r.patientId.patientId)) ||
          searchRegex.test(r.facility) ||
          searchRegex.test(r.department)
      );
    }

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get referral by ID with status timeline
// @route   GET /api/referrals/:id
// @access  Private
exports.getReferralById = async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId', 'name role phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    res.status(200).json({
      success: true,
      data: referral,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new referral
// @route   POST /api/referrals
// @access  Private (DOCTOR ONLY)
exports.createReferral = async (req, res, next) => {
  try {
    const {
      patientId,
      reason,
      facility,
      department,
      priority = 'ROUTINE',
      instructions,
    } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    if (!reason || !facility || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide referral reason, destination facility, and department',
      });
    }

    const referral = new Referral({
      patientId,
      doctorId: req.user._id,
      reason,
      facility,
      department,
      priority,
      instructions: instructions || '',
      status: 'CREATED',
      statusHistory: [
        {
          status: 'CREATED',
          updatedBy: req.user._id,
          note: 'Referral initiated by doctor',
          updatedAt: new Date(),
        },
      ],
    });

    const savedReferral = await referral.save();
    const populated = await Referral.findById(savedReferral._id)
      .populate('patientId', 'name patientId phone age gender village')
      .populate('doctorId', 'name role');

    res.status(201).json({
      success: true,
      message: 'Patient referral created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update referral status
// @route   PUT /api/referrals/:id/status
// @access  Private (ASHA & DOCTOR)
exports.updateReferralStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const referral = await Referral.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found',
      });
    }

    // Enforce strict sequential state machine transitions
    const validNextSteps = {
      'CREATED': ['ACCEPTED'],
      'ACCEPTED': ['PATIENT ARRIVED'],
      'PATIENT ARRIVED': ['COMPLETED'],
      'COMPLETED': [],
    };

    const allowedNext = validNextSteps[referral.status] || [];
    if (status !== referral.status && !allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid referral status transition from '${referral.status}' to '${status}'. Expected next step: ${allowedNext.join(', ') || 'None (Already Completed)'}`,
      });
    }

    referral.status = status;
    referral.statusHistory.push({
      status,
      updatedBy: req.user._id,
      note: note || `Referral status updated to ${status} by ${req.user.name} (${req.user.role})`,
      updatedAt: new Date(),
    });

    await referral.save();

    const updated = await Referral.findById(referral._id)
      .populate('patientId', 'name patientId phone age gender village')
      .populate('doctorId', 'name role');

    res.status(200).json({
      success: true,
      message: `Referral status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
