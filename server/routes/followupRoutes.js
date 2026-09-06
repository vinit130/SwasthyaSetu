const express = require('express');
const router = express.Router();
const {
  getFollowups,
  createFollowup,
  updateFollowup,
} = require('../controllers/followupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getFollowups)
  .post(authorize('DOCTOR'), createFollowup);

router.route('/:id')
  .put(updateFollowup);

module.exports = router;
