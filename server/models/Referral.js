const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referralToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
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
    hospitalId: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: [true, 'Referral reason is required'],
    },
    facility: {
      type: String,
      required: [true, 'Referred facility is required'],
    },
    department: {
      type: String,
      required: [true, 'Department / Specialty is required'],
    },
    priority: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      default: 'ROUTINE',
    },
    instructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'],
      default: 'CREATED',
    },
    bedNumber: {
      type: String,
      default: '',
    },
    admissionDate: {
      type: Date,
    },
    dischargeDate: {
      type: Date,
    },
    treatmentSummary: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['CREATED', 'ACCEPTED', 'PATIENT ARRIVED', 'COMPLETED'],
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: {
          type: String,
          default: '',
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save to push status history when status changes
referralSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedBy: this.doctorId,
      note: `Status changed to ${this.status}`,
      updatedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model('Referral', referralSchema);
