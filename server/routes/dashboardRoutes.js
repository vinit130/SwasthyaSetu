const express = require('express');
const router = express.Router();
const { getAshaDashboard, getDoctorDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/asha', authorize('ASHA'), getAshaDashboard);
router.get('/doctor', authorize('DOCTOR'), getDoctorDashboard);

module.exports = router;
