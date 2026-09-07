const express = require('express');
const router = express.Router();
const {
  getPatientDocuments,
  uploadDocument,
  viewDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/patient/:patientId', getPatientDocuments);
router.post('/', authorize('DOCTOR', 'DISTRICT_HOSPITAL', 'ASHA'), uploadDocument);
router.get('/:id/view', viewDocument);

module.exports = router;
