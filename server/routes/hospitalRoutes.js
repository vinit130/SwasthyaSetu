const express = require('express');
const router = express.Router();
const {
  getReferrals,
  getReferralByToken,
  emergencyLookup,
  getEncounters,
  createEncounter,
  getBeds,
  updateBed,
} = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/referrals', authorize('DISTRICT_HOSPITAL', 'HEALTH_DEPARTMENT_ADMIN'), getReferrals);
router.get('/referral-token/:token', authorize('DISTRICT_HOSPITAL', 'DOCTOR', 'HEALTH_DEPARTMENT_ADMIN'), getReferralByToken);
router.post('/emergency-lookup', authorize('DISTRICT_HOSPITAL'), emergencyLookup);
router.get('/encounters', authorize('DISTRICT_HOSPITAL', 'DOCTOR', 'HEALTH_DEPARTMENT_ADMIN'), getEncounters);
router.post('/encounters', authorize('DISTRICT_HOSPITAL'), createEncounter);
router.get('/beds', authorize('DISTRICT_HOSPITAL', 'HEALTH_DEPARTMENT_ADMIN', 'DOCTOR'), getBeds);
router.put('/beds/:id', authorize('DISTRICT_HOSPITAL'), updateBed);

module.exports = router;
