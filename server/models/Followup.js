const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: [true, 'Follow-up date is required'],
  },
  instructions: {
    type: String,
    required: [true, 'Follow-up instructions are required'],
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'MISSED'],
    default: 'PENDING',
  },
  notes: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Followup', followupSchema);
