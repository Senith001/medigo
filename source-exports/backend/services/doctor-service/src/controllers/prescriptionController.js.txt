import mongoose from "mongoose";
import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";

// @desc    Create prescription
// @route   POST /api/prescriptions
export const createPrescription = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      notes,
      issuedDate
    } = req.body;

    if (!doctorId || !patientId || !diagnosis || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "doctorId, patientId, diagnosis, and medicines are required"
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

    const prescription = await Prescription.create({
      doctorId,
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      notes,
      issuedDate
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message
    });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("doctorId", "fullName email specialty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error("Get all prescriptions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message
    });
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID"
      });
    }

    const prescription = await Prescription.findById(id).populate(
      "doctorId",
      "fullName email specialty"
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error("Get prescription by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message
    });
  }
};

// @desc    Get prescriptions by patient ID
// @route   GET /api/prescriptions/patient/:patientId
export const getPrescriptionsByPatientId = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId
    })
      .populate("doctorId", "fullName email specialty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error("Get prescriptions by patient error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch patient prescriptions",
      error: error.message
    });
  }
};

// @desc    Update prescription by ID
// @route   PUT /api/prescriptions/:id
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID"
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      data: updatedPrescription
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update prescription",
      error: error.message
    });
  }
};

// @desc    Delete prescription by ID
// @route   DELETE /api/prescriptions/:id
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID"
      });
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    await Prescription.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully"
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
      error: error.message
    });
  }
};