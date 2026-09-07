const mongoose = require('mongoose');
const mockStore = require('../utils/mockStore');
const Facility = require('../models/Facility');
const { getNearbyFacilities: getNearbyFromProvider } = require('../utils/facilityProvider');

// @desc    Get all healthcare facilities
// @route   GET /api/facilities
// @access  Private
exports.getAllFacilities = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getAllFacilities(req, res);
  }
  try {
    const { district, type, search } = req.query;
    const filter = {};
    if (district) filter.district = new RegExp(district, 'i');
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { district: new RegExp(search, 'i') },
        { subDistrict: new RegExp(search, 'i') },
      ];
    }

    const facilities = await Facility.find(filter).sort({ type: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return mockStore.getAllFacilities(req, res);
  }
};

// @desc    Get nearby facilities by coordinates or district
// @route   GET /api/facilities/nearby
// @access  Private
exports.getNearbyFacilities = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockStore.getNearbyFacilities(req, res);
  }
  try {
    const { lat, lng, district, maxDistance } = req.query;
    const facilities = getNearbyFromProvider({
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      district: district || 'Pune',
      maxDistanceKm: maxDistance ? parseFloat(maxDistance) : 60,
    });

    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (error) {
    console.error('Error finding nearby facilities:', error);
    return mockStore.getNearbyFacilities(req, res);
  }
};
