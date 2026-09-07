const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const InventoryItem = require('../models/InventoryItem');
const InventoryMovement = require('../models/InventoryMovement');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get medical inventory list
// @route   GET /api/inventory
// @access  Private (ALL ROLES - Read only for Doctor/ASHA, Admin/Hospital can see all)
exports.getInventory = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getInventory(req, res);
  }
  try {
    const { facility, status, search, category } = req.query;
    const filter = {};

    if (facility) {
      filter.facilityName = new RegExp(facility, 'i');
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { itemName: new RegExp(search, 'i') },
        { batchNumber: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
      ];
    }

    const items = await InventoryItem.find(filter).sort({ status: 1, itemName: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return mockStore.getInventory(req, res);
  }
};

// @desc    Record inventory stock movement (Inward, Dispensed, Expired, Transfer)
// @route   POST /api/inventory/movements
// @access  Private (DISTRICT_HOSPITAL, HEALTH_DEPARTMENT_ADMIN)
exports.createMovement = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.createInventoryMovement(req, res);
  }
  try {
    const {
      itemId,
      movementType,
      quantity,
      referenceNumber,
      notes,
      sourceFacility,
      destinationFacility,
    } = req.body;

    if (!itemId || !movementType || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid itemId, movementType, and positive quantity.',
      });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found.',
      });
    }

    const qty = Number(quantity);
    const balanceBefore = item.currentQuantity;
    let balanceAfter = balanceBefore;

    if (movementType === 'INWARD' || movementType === 'TRANSFER_IN') {
      balanceAfter += qty;
    } else {
      if (balanceBefore < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Current quantity: ${balanceBefore}, requested: ${qty}`,
        });
      }
      balanceAfter -= qty;
    }

    // Save immutable movement
    const movement = new InventoryMovement({
      itemId: item._id,
      itemName: item.itemName,
      batchNumber: item.batchNumber,
      movementType,
      quantity: qty,
      balanceBefore,
      balanceAfter,
      referenceNumber: referenceNumber || `REF-${Date.now()}`,
      notes: notes || '',
      sourceFacility: sourceFacility || item.facilityName,
      destinationFacility: destinationFacility || '',
      performedBy: req.user._id || req.user.id,
    });

    await movement.save();

    // Update item stock
    item.currentQuantity = balanceAfter;
    await item.save();

    // Log audit
    await logAudit({
      userId: req.user._id || req.user.id,
      action: 'UPDATE_INVENTORY_STOCK',
      role: req.user.role,
      details: `${movementType} of ${qty} ${item.unit} for '${item.itemName}' at ${item.facilityName}. New balance: ${balanceAfter}`,
    });

    res.status(201).json({
      success: true,
      message: `Stock movement recorded. New quantity for '${item.itemName}': ${balanceAfter} ${item.unit}`,
      data: {
        item,
        movement,
      },
    });
  } catch (error) {
    console.error('Error creating inventory movement:', error);
    return mockStore.createInventoryMovement(req, res);
  }
};
