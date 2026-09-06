const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password hash'],
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['ASHA', 'DOCTOR', 'PATIENT'],
    required: [true, 'Role must be either ASHA, DOCTOR, or PATIENT'],
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  language: {
    type: String,
    enum: ['en', 'bn'],
    default: 'en',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compare hashed password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
