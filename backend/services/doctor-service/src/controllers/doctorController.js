import Doctor from "../models/Doctor.js";
import axios from "axios";

// @desc    Create doctor profile (called internally by auth-service after registration)
// @route   POST /api/doctors/internal/create-profile
export const createProfileInternal = async (req, res) => {
  try {
    const {
      authUserId, userId, fullName, email, phone, category, nicNumber,
      specialty, qualifications, experienceYears,
      clinicLocation, consultationFee, bio, medicalLicenseNumber
    } = req.body;

    const existing = await Doctor.findOne({
      $or: [{ authUserId }, { email: email.toLowerCase() }, { medicalLicenseNumber }, { nicNumber }]
    });

    if (existing) {
      return res.status(200).json({ success: true, message: "Doctor profile already exists.", data: existing });
    }

    const doctor = await Doctor.create({
      authUserId,
      userId,
      fullName,
      email: email.toLowerCase(),
      phone,
      category,
      nicNumber,
      specialty,
      qualifications,
      experienceYears,
      clinicLocation,
      consultationFee,
      bio,
      medicalLicenseNumber,
      status: "pending"
    });

    res.status(201).json({ success: true, message: "Doctor profile created.", data: doctor });
  } catch (error) {
    console.error("Internal Create Doctor Profile Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to create doctor profile." });
  }
};

// @desc    Delete doctor profile (called internally by auth-service on account deletion)
// @route   DELETE /api/doctors/internal/delete-profile
export const deleteProfileInternal = async (req, res) => {
  try {
    const { authUserId, userId } = req.body;

    if (!authUserId && !userId) {
      return res.status(400).json({ success: false, message: "authUserId or userId is required." });
    }

    const query = authUserId ? { authUserId } : { userId };
    const doctor = await Doctor.findOne(query);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    await doctor.deleteOne();
    res.status(200).json({ success: true, message: "Doctor profile deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete doctor profile." });
  }
};

// @desc    Doctor deletes their own profile (cascades to auth-service)
// @route   DELETE /api/doctors/me
export const deleteMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ authUserId: req.user._id?.toString() || req.user.id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    // Delete from auth-service first
    try {
      await axios.delete(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/identities/${doctor.authUserId}`,
        { headers: { "x-service-secret": process.env.SERVICE_SECRET } }
      );
    } catch (authErr) {
      if (authErr.response?.status !== 404) {
        return res.status(500).json({ success: false, message: "Failed to delete auth identity." });
      }
    }

    await doctor.deleteOne();
    res.status(200).json({ success: true, message: "Doctor account deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete doctor profile." });
  }
};

// @desc    Get the currently logged-in doctor's own profile
// @route   GET /api/doctors/me
export const getMyProfile = async (req, res) => {
  try {
    // The JWT issued by auth-service embeds the userId (e.g. "D001") and email
    const doctor = await Doctor.findOne({
      $or: [
        { email: req.user.email },
        { userId: req.user.userId }
      ]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found. Please contact an admin."
      });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
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
      status
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
      status
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

// @desc    Update doctor by ID (PUT — full profile update)
// @route   PUT /api/doctors/:id
export const updateDoctor = async (req, res) => {
  try {
    // Support lookup by either Doctor._id or authUserId
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId
      ? { $or: [{ _id: req.params.id }, { authUserId: req.params.id }] }
      : { userId: req.params.id };

    const doctor = await Doctor.findOne(query);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
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

// @desc    Update doctor status (PATCH — called internally from admin-service)
// @route   PATCH /api/doctors/:id/status
export const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Support lookup by Doctor._id OR authUserId (admins may pass either)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId
      ? { $or: [{ _id: req.params.id }, { authUserId: req.params.id }] }
      : { userId: req.params.id };

    const doctor = await Doctor.findOne(query);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.status = status;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to "${status}".`,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update doctor status", error: error.message });
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

// @desc    Get doctor profile by email
// @route   GET /api/doctors/profile/:email
export const getDoctorByEmail = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.params.email });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message
    });
  }
};