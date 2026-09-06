const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: '1-2 days',
  },
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    default: 'Mild',
  },
  notes: {
    type: String,
    default: '',
  },
});

const vitalsSchema = new mongoose.Schema({
  temperature: {
    type: Number, // In Celsius (°C)
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  heartRate: {
    type: Number, // bpm
  },
  spO2: {
    type: Number, // percentage %
  },
  respiratoryRate: {
    type: Number, // breaths per min
  },
  weight: {
    type: Number, // kg
  },
});

const visitSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symptoms: [symptomSchema],
  vitals: vitalsSchema,
  suggestedRisk: {
    type: String,
    enum: ['GREEN', 'YELLOW', 'RED'],
    default: 'GREEN',
  },
  suggestedRiskReasons: {
    type: [String],
    default: [],
  },
  riskLevel: {
    type: String,
    enum: ['GREEN', 'YELLOW', 'RED', 'PENDING_REVIEW'],
    default: 'PENDING_REVIEW',
  },
  riskReasons: {
    type: [String],
    default: [],
  },
  doctorRiskNote: {
    type: String,
    default: '',
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  assessedAt: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['PENDING_REVIEW', 'REVIEWED', 'CONSULTED'],
    default: 'PENDING_REVIEW',
  },
  visitDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Visit', visitSchema);
