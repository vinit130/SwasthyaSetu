const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  checkDuplicate,
  assessRiskByDoctor,
  getPatientJourney,
} = require('../controllers/patientController');
const { getVisitsByPatient, createVisit } = require('../controllers/visitController');
const {
  getConsultationsByPatient,
  createConsultation,
} = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All patient endpoints require login
router.use(protect);

// Specific named routes BEFORE /:id
router.get('/me/journey', getPatientJourney);
router.post('/check-duplicate', checkDuplicate);

router.route('/')
  .get(getPatients)
  .post(authorize('ASHA', 'DOCTOR'), createPatient);

router.route('/:id')
  .get(getPatientById)
  .put(authorize('ASHA', 'DOCTOR'), updatePatient);

// Doctor authoritative risk confirmation
router.post('/:id/risk-assessment', authorize('DOCTOR'), assessRiskByDoctor);

// Nested visits
router.route('/:id/visits')
  .get(getVisitsByPatient)
  .post(authorize('ASHA', 'DOCTOR'), createVisit);

// Nested consultations (Doctor only for POST)
router.route('/:id/consultations')
  .get(getConsultationsByPatient)
  .post(authorize('DOCTOR'), createConsultation);

module.exports = router;
