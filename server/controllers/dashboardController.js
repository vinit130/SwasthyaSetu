const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Consultation = require('../models/Consultation');
const Referral = require('../models/Referral');
const Followup = require('../models/Followup');

// @desc    Get ASHA Worker Dashboard summary & lists
// @route   GET /api/dashboard/asha
// @access  Private (ASHA ONLY)
exports.getAshaDashboard = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const pendingReferralsCount = await Referral.countDocuments({
      status: { $in: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'] },
    });
    const upcomingFollowupsCount = await Followup.countDocuments({ status: 'PENDING' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentlyRegisteredCount = await Patient.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Recent patients (last 6)
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const patientIds = recentPatients.map((p) => p._id);
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

    const enrichedRecentPatients = recentPatients.map((p) => ({
      ...p,
      lastVisit: visitMap[p._id.toString()] || null,
      currentRisk: visitMap[p._id.toString()] ? visitMap[p._id.toString()].riskLevel : 'GREEN',
    }));

    // Pending follow-ups
    const pendingFollowups = await Followup.find({ status: 'PENDING' })
      .populate('patientId', 'name patientId phone age gender village')
      .populate('doctorId', 'name')
      .sort({ date: 1 })
      .limit(6);

    // Active referrals
    const activeReferrals = await Referral.find({
      status: { $in: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'] },
    })
      .populate('patientId', 'name patientId phone village')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalPatients,
          pendingReferrals: pendingReferralsCount,
          upcomingFollowups: upcomingFollowupsCount,
          recentlyRegistered: recentlyRegisteredCount,
        },
        recentPatients: enrichedRecentPatients,
        pendingFollowups,
        pendingReferrals: activeReferrals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor Dashboard metrics & prioritized review queue
// @route   GET /api/dashboard/doctor
// @access  Private (DOCTOR ONLY)
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    // Patients requiring review (Visits with status PENDING_REVIEW or high/medium risk)
    const pendingReviewVisits = await Visit.find({
      status: 'PENDING_REVIEW',
    })
      .populate('patientId', 'name patientId age gender phone village district')
      .populate('recordedBy', 'name role')
      .sort({
        // RED first, then YELLOW, then GREEN
        visitDate: -1,
      })
      .limit(10)
      .lean();

    // Sort so RED comes before YELLOW comes before GREEN
    const priorityWeight = { RED: 3, YELLOW: 2, GREEN: 1 };
    pendingReviewVisits.sort((a, b) => (priorityWeight[b.riskLevel] || 1) - (priorityWeight[a.riskLevel] || 1));

    // Today's consultations count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayConsultationsCount = await Consultation.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const pendingReferralsCount = await Referral.countDocuments({
      status: { $in: ['CREATED', 'ACCEPTED'] },
    });

    const upcomingFollowupsCount = await Followup.countDocuments({
      status: 'PENDING',
    });

    const totalAwaitingReview = await Visit.countDocuments({
      status: 'PENDING_REVIEW',
    });

    // Recent consultations
    const recentConsultations = await Consultation.find()
      .populate('patientId', 'name patientId age gender village')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Active referrals
    const activeReferrals = await Referral.find({
      status: { $in: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'] },
    })
      .populate('patientId', 'name patientId age gender village')
      .sort({ createdAt: -1 })
      .limit(5);

    // Upcoming follow-ups
    const upcomingFollowups = await Followup.find({ status: 'PENDING' })
      .populate('patientId', 'name patientId age gender village phone')
      .sort({ date: 1 })
      .limit(5);

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
  } catch (error) {
    next(error);
  }
};
