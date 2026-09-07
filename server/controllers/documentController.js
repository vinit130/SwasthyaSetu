const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get medical documents for a patient
// @route   GET /api/documents/patient/:patientId
// @access  Private (PATIENT isolated, DOCTOR, DISTRICT_HOSPITAL, ASHA)
exports.getPatientDocuments = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getPatientDocuments(req, res);
  }
  try {
    const { patientId } = req.params;

    // Strict patient isolation enforcement: PATIENT role can only view their own documents
    if (req.user.role === 'PATIENT') {
      const userPatientId = req.user.patientId?.toString();
      if (userPatientId !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your own health records.',
        });
      }
    }

    const docs = await MedicalDocument.find({ patientId })
      .populate('uploadedBy', 'name role')
      .select('-fileData') // Exclude heavy payload in listing for performance
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    return mockStore.getPatientDocuments(req, res);
  }
};

// @desc    Upload new medical document (Prescription, Lab report, Scan, Discharge summary)
// @route   POST /api/documents
// @access  Private (DOCTOR, DISTRICT_HOSPITAL, ASHA)
exports.uploadDocument = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.uploadDocument(req, res);
  }
  try {
    const {
      patientId,
      title,
      documentType,
      fileName,
      fileData,
      mimeType,
      fileSize,
      facilityName,
      doctorNotes,
    } = req.body;

    if (!patientId || !title || !documentType || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID, title, document type, and file data.',
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    const doc = new MedicalDocument({
      patientId,
      title: title.trim(),
      documentType,
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileData,
      mimeType: mimeType || 'application/pdf',
      fileSize: fileSize || Math.round(fileData.length * 0.75),
      facilityName: facilityName || '',
      uploadedBy: req.user._id || req.user.id,
      uploaderRole: req.user.role,
      doctorNotes: doctorNotes || '',
    });

    const saved = await doc.save();

    // Log audit
    await logAudit({
      userId: req.user._id || req.user.id,
      patientId,
      action: 'UPLOAD_MEDICAL_DOCUMENT',
      role: req.user.role,
      details: `Uploaded ${documentType}: '${title}' for patient ${patient.name} (${patient.patientId})`,
    });

    // Return without fileData to avoid sending back large base64
    const result = saved.toObject();
    delete result.fileData;

    res.status(201).json({
      success: true,
      message: 'Medical document uploaded securely',
      data: result,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return mockStore.uploadDocument(req, res);
  }
};

// @desc    View/Download specific medical document by ID
// @route   GET /api/documents/:id/view
// @access  Private (With strict patient isolation)
exports.viewDocument = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.viewDocument(req, res);
  }
  try {
    const doc = await MedicalDocument.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Medical document not found.',
      });
    }

    // Strict patient isolation enforcement
    if (req.user.role === 'PATIENT') {
      const userPatientId = req.user.patientId?.toString();
      if (userPatientId !== doc.patientId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are only authorized to view your own health records.',
        });
      }
    }

    // Log view audit
    await logAudit({
      userId: req.user._id || req.user.id,
      patientId: doc.patientId,
      action: 'VIEW_MEDICAL_DOCUMENT',
      role: req.user.role,
      details: `Viewed ${doc.documentType} '${doc.title}'`,
    });

    res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error('Error viewing document:', error);
    return mockStore.viewDocument(req, res);
  }
};
