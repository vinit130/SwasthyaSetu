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
      enum: ['PRESCRIPTION', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'REFERRAL_SLIP', 'DIAGNOSTIC_SCAN', 'OTHER'],
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
    fileType: {
      type: String,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      required: true,
    },
    fileSize: {
      type: Number,
      max: [5242880, 'File size cannot exceed 5MB'],
      required: true,
    },
    fileData: {
      type: String, // Base64 data URI for safe portable storage abstraction
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
