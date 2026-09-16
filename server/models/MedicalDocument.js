const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderRole: {
      type: String,
      enum: ['ASHA', 'DOCTOR', 'DISTRICT_HOSPITAL'],
      required: true,
    },
    facilityName: {
      type: String,
      default: '',
    },
    documentType: {
      type: String,
      enum: [
        'PRESCRIPTION',
        'LAB_REPORT',
        'BLOOD_TEST',
        'IMAGING_REPORT',
        'CT_SCAN',
        'X_RAY',
        'ULTRASOUND',
        'DISCHARGE_SUMMARY',
        'REFERRAL_SLIP',
        'DIAGNOSTIC_SCAN',
        'OTHER',
      ],
      default: 'PRESCRIPTION',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: 'application/pdf',
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    fileSize: {
      type: Number,
      max: [10485760, 'File size cannot exceed 10MB'],
      required: true,
    },
    storageProvider: {
      type: String,
      enum: ['SUPABASE', 'LOCAL_FALLBACK'],
      default: 'SUPABASE',
    },
    storagePath: {
      type: String,
      default: null,
      index: true,
    },
    fileData: {
      type: String, // Base64 fallback when Supabase is not configured
      required: false,
    },
    notes: {
      type: String,
      default: '',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
