const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
  },
  observations: {
    type: String,
    required: [true, 'Clinical observations are required'],
  },
  assessment: {
    type: String,
    required: [true, 'Doctor assessment is required'],
  },
  advice: {
    type: String,
    default: '',
  },
  treatmentInstructions: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Consultation', consultationSchema);
