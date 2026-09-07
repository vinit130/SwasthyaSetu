const express = require('express');
const router = express.Router();
const {
  getAllFacilities,
  getNearbyFacilities,
} = require('../controllers/facilityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAllFacilities);
router.get('/nearby', getNearbyFacilities);

module.exports = router;
