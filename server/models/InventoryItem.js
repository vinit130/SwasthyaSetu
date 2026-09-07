const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    facilityId: {
      type: String,
      required: true,
      index: true,
    },
    facilityName: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['MEDICINE', 'INJECTION', 'IV_FLUID', 'SURGICAL', 'PPE', 'EMERGENCY', 'EQUIPMENT'],
      default: 'MEDICINE',
      index: true,
    },
    unit: {
      type: String,
      default: 'strips',
    },
    quantityAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumStockLevel: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    maximumStockLevel: {
      type: Number,
      default: 500,
    },
    batchNumber: {
      type: String,
      trim: true,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON'],
      default: 'IN_STOCK',
      index: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Pre-save hook to calculate status automatically
inventoryItemSchema.pre('save', function (next) {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (this.quantityAvailable <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.expiryDate && new Date(this.expiryDate) < thirtyDaysLater) {
    this.status = 'EXPIRING_SOON';
  } else if (this.quantityAvailable <= this.minimumStockLevel) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
