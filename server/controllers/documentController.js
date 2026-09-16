const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const MedicalDocument = require('../models/MedicalDocument');
const Patient = require('../models/Patient');
const { logAudit } = require('../utils/auditLogger');
const supabaseClient = require('../utils/supabaseClient');

// @desc    Get medical documents for a patient
// @route   GET /api/documents/patient/:patientId
// @access  Private (PATIENT isolated, DOCTOR, DISTRICT_HOSPITAL, ASHA)
exports.getPatientDocuments = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getPatientDocuments(req, res);
  }
  try {
    const { patientId } = req.params;

    // Least privilege: Health Department has aggregate surveillance access, not individual document access
    if (req.user.role === 'HEALTH_DEPARTMENT_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Health Department administrators have surveillance-level access and cannot view individual patient medical documents under clinical privacy policies.',
      });
    }

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
      .select('-fileData') // Exclude heavy payload in listing for high-speed performance
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
    const hasMultipartFile = Boolean(req.file && req.file.buffer);
    const hasBase64File = Boolean(req.body && req.body.fileData);

    // ONLY FILE IS REQUIRED
    if (!hasMultipartFile && !hasBase64File) {
      return res.status(400).json({
        success: false,
        message: 'Please select or capture a file.',
      });
    }

    // Automatically derive patient context
    let patientId = req.body?.patientId || req.query?.patientId || req.params?.patientId;
    if (!patientId && req.user?.role === 'PATIENT') {
      patientId = req.user?.patientId?.toString();
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Active patient context is required for document upload.',
      });
    }

    // Verify patient exists (supports MongoDB ObjectId or patient identifier like SS-2026-0001)
    let patient = null;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await Patient.findById(patientId);
    }
    if (!patient) {
      patient = await Patient.findOne({ patientId: patientId });
    }
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    let fileBuffer;
    let originalName;
    let detectedType;
    let finalFileSize;
    const fileData = req.body?.fileData;
    const facilityName = req.body?.facilityName || req.user?.facilityName || '';

    if (hasMultipartFile) {
      fileBuffer = req.file.buffer;
      originalName = req.file.originalname || req.body?.fileName || 'medical_document.jpg';
      detectedType = req.file.mimetype || 'image/jpeg';
      finalFileSize = req.file.size;
    } else {
      const base64Content = fileData.includes(';base64,') ? fileData.split(';base64,')[1] : fileData;
      fileBuffer = Buffer.from(base64Content, 'base64');
      originalName = req.body?.fileName || 'medical_document.pdf';
      detectedType = req.body?.mimeType || req.body?.fileType || 'application/pdf';
      finalFileSize = req.body?.fileSize || fileBuffer.length;
    }

    // Prototype limit guard: 10MB
    if (finalFileSize > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum allowed size is 10 MB.',
      });
    }

    // Document title is completely OPTIONAL: if blank, auto-derive from original filename
    let title = req.body?.title ? req.body.title.trim() : '';
    if (!title) {
      const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      title = cleanName || 'Medical Document';
    }

    const documentType = req.body?.documentType || 'OTHER';
    const cleanNotes = req.body?.doctorNotes || req.body?.notes || req.body?.clinicalFindings || '';
    const cleanFileName = supabaseClient.sanitizeFileName(originalName);
    const docId = new mongoose.Types.ObjectId();

    let storagePath = null;
    let storageProvider = 'LOCAL_FALLBACK';
    let savedFileData = hasBase64File ? fileData : `data:${detectedType};base64,${fileBuffer.toString('base64')}`;

    // Check if real Supabase Storage is configured
    if (supabaseClient.isSupabaseConfigured()) {
      try {
        const targetPath = supabaseClient.buildStoragePath(patientId, docId, cleanFileName);
        const uploadResult = await supabaseClient.uploadToSupabase(targetPath, fileBuffer, detectedType);
        storagePath = uploadResult.storagePath;
        storageProvider = 'SUPABASE';
        savedFileData = undefined; // Drop heavy binary from MongoDB when in Supabase
        console.log(`[Supabase Storage] Successfully uploaded document to ${storagePath}`);
      } catch (uploadErr) {
        console.warn('[Supabase Storage] Upload failed, falling back to database storage:', uploadErr.message);
        storageProvider = 'LOCAL_FALLBACK';
        savedFileData = hasBase64File ? fileData : `data:${detectedType};base64,${fileBuffer.toString('base64')}`;
      }
    } else {
      console.log('[DocumentStorage] Supabase unconfigured; persisting in local portable store.');
    }

    const doc = new MedicalDocument({
      _id: docId,
      patientId,
      title: title.trim(),
      documentType: documentType || 'PRESCRIPTION',
      fileName: cleanFileName,
      originalFileName: originalName,
      storagePath,
      storageProvider,
      fileData: savedFileData,
      fileType: detectedType,
      mimeType: detectedType,
      fileSize: finalFileSize,
      facilityName: facilityName || req.user.facilityName || '',
      uploadedBy: req.user._id || req.user.id,
      uploaderRole: req.user.role,
      notes: cleanNotes,
      doctorNotes: cleanNotes,
    });

    const saved = await doc.save();

    // Log audit
    await logAudit(req, {
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'MedicalDocument',
      resourceId: docId,
      facilityId: req.user.facilityId || null,
      district: req.user.assignedDistrict || null,
      details: `Uploaded ${documentType}: '${title}' for patient ${patient.name} (${patient.patientId}) via ${storageProvider}`,
    });

    // Return without fileData to avoid sending back large base64 payload
    const result = saved.toObject();
    delete result.fileData;

    res.status(201).json({
      success: true,
      message: storageProvider === 'SUPABASE'
        ? 'Medical document uploaded securely to Supabase Storage'
        : 'Medical document uploaded securely (local fallback mode)',
      storageProvider,
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

    // Least privilege: Health Department has aggregate surveillance access, not individual document access
    if (req.user.role === 'HEALTH_DEPARTMENT_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Health Department administrators have surveillance-level access and cannot view individual patient medical documents under clinical privacy policies.',
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
    await logAudit(req, {
      action: 'DOCUMENT_VIEWED',
      resourceType: 'MedicalDocument',
      resourceId: doc._id,
      facilityId: req.user.facilityId || null,
      district: req.user.assignedDistrict || null,
      details: `Viewed ${doc.documentType} '${doc.title}' (Provider: ${doc.storageProvider})`,
    });

    const docObj = doc.toObject();

    // Generate signed URL if stored in Supabase
    if (doc.storageProvider === 'SUPABASE' && doc.storagePath && supabaseClient.isSupabaseConfigured()) {
      try {
        const signedUrl = await supabaseClient.createSignedUrl(doc.storagePath, 300);
        docObj.signedUrl = signedUrl;
      } catch (signedErr) {
        console.error('Failed to generate Supabase signed URL:', signedErr);
      }
    }

    res.status(200).json({
      success: true,
      data: docObj,
    });
  } catch (error) {
    console.error('Error viewing document:', error);
    return mockStore.viewDocument(req, res);
  }
};
