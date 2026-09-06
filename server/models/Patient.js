const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Please enter a valid age'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'West Bengal',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown',
    },
    allergies: {
      type: [String],
      default: [],
    },
    existingConditions: {
      type: [String],
      default: [],
    },
    currentRisk: {
      type: String,
      enum: ['GREEN', 'YELLOW', 'RED', 'PENDING_REVIEW'],
      default: 'PENDING_REVIEW',
    },
    riskNote: {
      type: String,
      default: '',
    },
    riskAssessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    riskAssessedAt: {
      type: Date,
    },
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate readable patientId if not present
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Patient').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.patientId = `SS-${year}-${sequence}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
