const mongoose = require('mongoose');

const hospitalEncounterSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    facilityId: {
      type: String,
      required: true,
      index: true,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
      default: null,
    },
    encounterType: {
      type: String,
      enum: ['REFERRAL_ADMISSION', 'EMERGENCY_DIRECT'],
      default: 'REFERRAL_ADMISSION',
      required: true,
      index: true,
    },
    breakGlassReason: {
      type: String,
      default: '',
    },
    attendingDoctor: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      default: '',
    },
    bedNumber: {
      type: String,
      default: '',
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    dischargeDate: {
      type: Date,
    },
    diagnosis: {
      type: String,
      required: [true, 'Clinical diagnosis / assessment is required'],
      trim: true,
    },
    procedures: {
      type: [String],
      default: [],
    },
    medicinesPrescribed: {
      type: [String],
      default: [],
    },
    treatmentNotes: {
      type: String,
      default: '',
    },
    dischargeInstructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ADMITTED', 'UNDER_TREATMENT', 'DISCHARGED', 'REFERRED_FURTHER'],
      default: 'ADMITTED',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HospitalEncounter', hospitalEncounterSchema);
