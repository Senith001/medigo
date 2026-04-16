import Availability from "../models/Availability.js";

// @desc    Create availability
// @route   POST /api/availability
export const createAvailability = async (req, res) => {
  try {
    const { doctorId, day, date, startTime, endTime, hospital, location, fee } = req.body;
    const availability = await Availability.create({
      doctorId,
      day,
      date,
      startTime,
      endTime,
      hospital,
      location,
      fee,
      isAvailable: true
    });
    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all availability
// @route   GET /api/availability
export const getAllAvailability = async (req, res) => {
  try {
    const availabilities = await Availability.find({});
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get availability by doctor ID
// @route   GET /api/availability/doctor/:doctorId
export const getAvailabilityByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilities = await Availability.find({ doctorId });
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability
// @route   PUT /api/availability/:id
export const updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
export const deleteAvailability = async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Availability removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Aliases for compatibility with newer code
export const addAvailability = createAvailability;
export const getAvailability = getAvailabilityByDoctorId;