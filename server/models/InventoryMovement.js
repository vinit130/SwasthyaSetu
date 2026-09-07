const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
      index: true,
    },
    facilityId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['ADD', 'DISPENSE', 'ADJUSTMENT', 'EMERGENCY_TRANSFER', 'EXPIRED'],
      required: true,
    },
    quantityChanged: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Movement reason is required for audit trail'],
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
