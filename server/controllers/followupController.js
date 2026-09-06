const Followup = require('../models/Followup');
const Patient = require('../models/Patient');

// @desc    Get all follow-ups with filters
// @route   GET /api/followups
// @access  Private (ASHA & DOCTOR)
exports.getFollowups = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    let followups = await Followup.find(query)
      .populate('patientId', 'name patientId phone age gender village district')
      .populate('doctorId', 'name role')
      .populate('completedBy', 'name role')
      .sort({ date: 1 });

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      followups = followups.filter(
        (f) =>
          (f.patientId && searchRegex.test(f.patientId.name)) ||
          (f.patientId && searchRegex.test(f.patientId.patientId)) ||
          (f.patientId && searchRegex.test(f.patientId.village)) ||
          searchRegex.test(f.instructions)
      );
    }

    res.status(200).json({
      success: true,
      count: followups.length,
      data: followups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new follow-up
// @route   POST /api/followups
// @access  Private (DOCTOR ONLY)
exports.createFollowup = async (req, res, next) => {
  try {
    const { patientId, date, dueDate, instructions, notes } = req.body;
    const targetDate = date || dueDate;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found',
      });
    }

    if (!targetDate || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date and instructions are required',
      });
    }

    const followup = new Followup({
      patientId,
      doctorId: req.user._id,
      date: new Date(targetDate),
      instructions,
      notes: notes || '',
      status: 'PENDING',
    });

    const savedFollowup = await followup.save();
    const populated = await Followup.findById(savedFollowup._id)
      .populate('patientId', 'name patientId phone age gender village')
      .populate('doctorId', 'name role');

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up status (e.g. Mark Completed)
// @route   PUT /api/followups/:id
// @access  Private (ASHA & DOCTOR)
exports.updateFollowup = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['PENDING', 'COMPLETED', 'MISSED'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed: ${allowed.join(', ')}`,
      });
    }

    const followup = await Followup.findById(req.params.id);
    if (!followup) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up record not found',
      });
    }

    if (status) {
      followup.status = status;
      if (status === 'COMPLETED') {
        followup.completedAt = new Date();
        followup.completedBy = req.user._id;
      }
    }

    if (notes !== undefined) {
      followup.notes = notes;
    }

    await followup.save();

    const updated = await Followup.findById(followup._id)
      .populate('patientId', 'name patientId phone age gender village')
      .populate('doctorId', 'name role')
      .populate('completedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Follow-up marked as ${followup.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
