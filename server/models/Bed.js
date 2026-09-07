const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    facilityId: {
      type: String,
      required: true,
      index: true,
    },
    ward: {
      type: String,
      enum: ['GENERAL_MALE', 'GENERAL_FEMALE', 'ICU', 'MATERNITY', 'EMERGENCY', 'PEDIATRIC'],
      required: true,
      index: true,
    },
    bedNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
      default: 'AVAILABLE',
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    patientName: {
      type: String,
      default: '',
    },
    admissionDate: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a bed number is unique within a ward of a facility
bedSchema.index({ facilityId: 1, ward: 1, bedNumber: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
