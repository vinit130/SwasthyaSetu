const express = require('express');
const router = express.Router();
const {
  getOverview,
  getFacilities,
  getSurveillance,
  getAuditLogs,
} = require('../controllers/healthAdminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All Health Admin routes require login and HEALTH_DEPARTMENT_ADMIN role
router.use(protect);
router.use(authorize('HEALTH_DEPARTMENT_ADMIN'));

router.get('/overview', getOverview);
router.get('/facilities', getFacilities);
router.get('/surveillance', getSurveillance);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
