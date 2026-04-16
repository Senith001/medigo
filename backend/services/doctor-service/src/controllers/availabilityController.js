import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import Doctor from "../models/Doctor.js";

// @desc    Create availability slot
// @route   POST /api/availability
export const createAvailability = async (req, res) => {
  try {
    const { doctorId, day, date, startTime, endTime, isAvailable } = req.body;

    if (!doctorId || !day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "doctorId, day, startTime, and endTime are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctorId"
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const availability = await Availability.create({
      doctorId,
      day,
      date,
      startTime,
      endTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({
      success: true,
      message: "Availability created successfully",
      data: availability
    });
  } catch (error) {
    console.error("Create availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create availability",
      error: error.message
    });
  }
};

// @desc    Get all availability slots
// @route   GET /api/availability
export const getAllAvailability = async (req, res) => {
  try {
    const availability = await Availability.find()
      .populate("doctorId", "fullName email specialty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    console.error("Get all availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
      error: error.message
    });
  }
};

// @desc    Get availability by doctor ID
// @route   GET /api/availability/doctor/:doctorId
export const getAvailabilityByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctorId"
      });
    }

    const availability = await Availability.find({ doctorId }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: availability
    });
  } catch (error) {
    console.error("Get availability by doctor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor's availability",
      error: error.message
    });
  }
};

// @desc    Update availability by ID
// @route   PUT /api/availability/:id
export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability ID"
      });
    }

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found"
      });
    }

    const updatedAvailability = await Availability.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: updatedAvailability
    });
  } catch (error) {
    console.error("Update availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update availability",
      error: error.message
    });
  }
};

// @desc    Delete availability by ID
// @route   DELETE /api/availability/:id
export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability ID"
      });
    }

    const availability = await Availability.findById(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found"
      });
    }

    await Availability.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Availability deleted successfully"
    });
  } catch (error) {
    console.error("Delete availability error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete availability",
      error: error.message
    });
  }
};