const express = require('express');
const router = express.Router();
const { assessPatientRisk } = require('../controllers/riskController');
const { protect } = require('../middleware/auth');

router.post('/assess', protect, assessPatientRisk);

module.exports = router;
