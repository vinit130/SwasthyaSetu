const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getPatientDocuments,
  uploadDocument,
  viewDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Multer in-memory storage for multipart uploads (10MB limit)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype) || file.originalname?.match(/\.(pdf|jpe?g|png|webp)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only PDF, JPEG, PNG, and WebP are accepted.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

router.use(protect);

router.get('/patient/:patientId', getPatientDocuments);
router.post(
  '/',
  authorize('DOCTOR', 'DISTRICT_HOSPITAL', 'ASHA'),
  upload.single('file'),
  uploadDocument
);
router.get('/:id/view', viewDocument);

module.exports = router;
