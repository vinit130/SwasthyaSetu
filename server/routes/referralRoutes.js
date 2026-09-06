const express = require('express');
const router = express.Router();
const {
  getReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
} = require('../controllers/referralController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getReferrals)
  .post(authorize('DOCTOR'), createReferral);

router.route('/:id')
  .get(getReferralById);

router.route('/:id/status')
  .put(updateReferralStatus);

module.exports = router;
