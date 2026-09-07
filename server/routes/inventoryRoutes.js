const express = require('express');
const router = express.Router();
const {
  getInventory,
  createMovement,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Read inventory is open to all authenticated users (Doctors need to know available meds, ASHA needs kit status)
router.get('/', getInventory);

// Modifying stock is restricted to DISTRICT_HOSPITAL and HEALTH_DEPARTMENT_ADMIN
router.post('/movements', authorize('DISTRICT_HOSPITAL', 'HEALTH_DEPARTMENT_ADMIN'), createMovement);

module.exports = router;
