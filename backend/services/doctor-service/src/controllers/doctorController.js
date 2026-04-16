import Doctor from "../models/Doctor.js";

// @desc    Get all pending doctors
// @route   GET /api/doctors/pending
export const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: "pending" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctors",
      error: error.message
    });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
export const createDoctor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      specialty,
      qualifications,
      experienceYears,
      clinicLocation,
      consultationFee,
      bio,
      status,
      authUserId,
      userId
    } = req.body;

    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor with this email already exists"
      });
    }

    const doctor = await Doctor.create({
      fullName,
      email,
      phone,
      specialty,
      qualifications,
      experienceYears,
      clinicLocation,
      consultationFee,
      bio,
      status,
      authUserId,
      userId
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message
    });
  }
};

// @desc    Update doctor by ID
// @route   PUT /api/doctors/:id
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message
    });
  }
};

// @desc    Delete doctor by ID
// @route   DELETE /api/doctors/:id
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message
    });
  }
};