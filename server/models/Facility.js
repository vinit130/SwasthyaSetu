const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['DISTRICT_HOSPITAL', 'SUB_DISTRICT_HOSPITAL', 'RURAL_HOSPITAL', 'PHC', 'SUB_CENTRE'],
      required: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    block: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    availableBeds: {
      type: Number,
      default: 0,
    },
    icuBeds: {
      type: Number,
      default: 0,
    },
    availableIcuBeds: {
      type: Number,
      default: 0,
    },
    servicesOffered: {
      type: [String],
      default: [],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
