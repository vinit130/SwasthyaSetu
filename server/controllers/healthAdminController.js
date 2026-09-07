const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const Patient = require('../models/Patient');
const Facility = require('../models/Facility');
const Referral = require('../models/Referral');
const InventoryItem = require('../models/InventoryItem');
const AuditLog = require('../models/AuditLog');
const Bed = require('../models/Bed');

// @desc    Get statewide health department administrative overview
// @route   GET /api/admin/overview
// @access  Private (HEALTH_DEPARTMENT_ADMIN)
exports.getOverview = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getHealthAdminOverview(req, res);
  }
  try {
    const totalPatients = await Patient.countDocuments();
    const highRiskCount = await Patient.countDocuments({ currentRisk: 'RED' });
    const mediumRiskCount = await Patient.countDocuments({ currentRisk: 'YELLOW' });
    const lowRiskCount = await Patient.countDocuments({ currentRisk: 'GREEN' });
    const pendingReviewCount = await Patient.countDocuments({ currentRisk: 'PENDING_REVIEW' });

    const totalFacilities = await Facility.countDocuments();
    const facilities = await Facility.find().lean();
    const totalBeds = facilities.reduce((sum, f) => sum + (f.totalBeds || 0), 0);
    const occupiedBeds = facilities.reduce((sum, f) => sum + (f.occupiedBeds || 0), 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    const totalReferrals = await Referral.countDocuments();
    const activeReferrals = await Referral.countDocuments({ status: { $in: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED'] } });
    const completedReferrals = await Referral.countDocuments({ status: 'COMPLETED' });

    const lowStockItems = await InventoryItem.find({
      status: { $in: ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'] },
    }).lean();

    // District breakdown aggregation
    const districtBreakdown = await Patient.aggregate([
      {
        $group: {
          _id: '$district',
          total: { $sum: 1 },
          highRisk: { $sum: { $cond: [{ $eq: ['$currentRisk', 'RED'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$currentRisk', 'YELLOW'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$currentRisk', 'GREEN'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

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
        bedOccupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        totalReferrals,
        activeReferrals,
        completedReferrals,
        criticalShortages: lowStockItems.length,
        districts: districtBreakdown.map((d) => ({
          district: d._id || 'Unknown',
          total: d.total,
          highRisk: d.highRisk,
          mediumRisk: d.mediumRisk,
          lowRisk: d.lowRisk,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return mockStore.getHealthAdminOverview(req, res);
  }
};

// @desc    Get statewide facilities directory with real-time bed occupancy
// @route   GET /api/admin/facilities
// @access  Private (HEALTH_DEPARTMENT_ADMIN)
exports.getFacilities = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getHealthAdminFacilities(req, res);
  }
  try {
    const { district, type } = req.query;
    const filter = {};
    if (district) filter.district = new RegExp(district, 'i');
    if (type) filter.type = type;

    const facilities = await Facility.find(filter).sort({ type: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (error) {
    console.error('Error fetching admin facilities:', error);
    return mockStore.getHealthAdminFacilities(req, res);
  }
};

// @desc    Get public health surveillance and disease cluster analytics
// @route   GET /api/admin/surveillance
// @access  Private (HEALTH_DEPARTMENT_ADMIN)
exports.getSurveillance = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getHealthAdminSurveillance(req, res);
  }
  try {
    return mockStore.getHealthAdminSurveillance(req, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get immutable security and clinical audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (HEALTH_DEPARTMENT_ADMIN)
exports.getAuditLogs = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getAuditLogs(req, res);
  }
  try {
    const { action, role, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (role) filter.role = role;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name role email')
      .populate('patientId', 'name patientId')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return mockStore.getAuditLogs(req, res);
  }
};
