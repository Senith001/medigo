import Patient from "../models/Patient.js";
import axios from "axios";
import fs from "fs";
import path from "path";

export const createProfileInternal = async (req, res) => {
  try {
    const { authUserId, userId, fullName, email, phone } = req.body;

    const existing = await Patient.findOne({
      $or: [{ authUserId }, { email: email.toLowerCase() }]
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Patient profile already exists",
        data: existing
      });
    }

    const patient = await Patient.create({
      authUserId,
      userId,
      fullName,
      email: email.toLowerCase(),
      phone
    });

    res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      data: patient
    });
  } catch (error) {
    console.error("Internal Create Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create patient profile" });
  }
};

export const deleteProfileInternal = async (req, res) => {
  try {
    const { authUserId, userId } = req.body;

    if (!authUserId && !userId) {
      return res.status(400).json({
        success: false,
        message: "authUserId or userId is required"
      });
    }

    const query = authUserId ? { authUserId } : { userId };
    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found in Patient DB"
      });
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: "Patient profile deleted successfully"
    });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ authUserId: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. Update My Profile (With Auth Sync)
// ==========================================
export const updateMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ authUserId: req.user.id });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    const allowedFields = [
      "fullName", "phone", "gender", "dateOfBirth", 
      "bloodGroup", "address", "emergencyContactName", "emergencyContactPhone"
    ];

    let needsAuthSync = false;
    const authPayload = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
        
        // Track if they updated core identity fields
        if (field === "fullName" || field === "phone") {
          needsAuthSync = true;
          authPayload[field] = req.body[field];
        }
      }
    });

    await patient.save();

    // 🔄 SYNC WITH AUTH SERVICE
    if (needsAuthSync) {
      try {
        await axios.put(
          `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${patient.authUserId}`,
          authPayload,
          { headers: { "x-service-secret": process.env.SERVICE_SECRET } }
        );
      } catch (syncError) {
        console.error("Warning: Failed to sync profile update with Auth Service:", syncError.message);
      }
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", data: patient });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ success: false, message: "An unexpected error occurred while updating your profile." });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPatientById = async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin/Superadmin deletion of patient profile only.
// Full account deletion must be orchestrated by Admin Service or Auth Service.
export const deletePatient = async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found in Patient DB"
      });
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: "Patient profile deleted successfully"
    });
  } catch (error) {
    console.error("Delete Patient Profile Error:", error.message);

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting the patient profile."
    });
  }
};

// ==========================================
//  Upload / Update Profile Picture
// ==========================================
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image file" });
    }

    const patient = await Patient.findOne({ authUserId: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient profile not found" });
    }

    // If the patient already has a picture, delete the old one from the server to save space!
    if (patient.profilePicture) {
      const oldImagePath = path.join(process.cwd(), patient.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save the new file path to the database
    // Normalizing path for cross-platform compatibility
    patient.profilePicture = req.file.path.replace(/\\/g, "/"); 
    await patient.save();

    const fullImageUrl = `${req.protocol}://${req.get("host")}/${patient.profilePicture}`;

    res.status(200).json({ 
      success: true, 
      message: "Profile picture updated successfully", 
      profilePicture: patient.profilePicture ,
      profilePictureUrl: fullImageUrl
    });

  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to upload profile picture" });
  }
};

// ==========================================
//  Delete Profile Picture
// ==========================================
export const deleteProfilePicture = async (req, res) => {
  try {
    const patient = await Patient.findOne({ authUserId: req.user.id });

    if (!patient || !patient.profilePicture) {
      return res.status(400).json({ success: false, message: "No profile picture found to delete" });
    }

    // Delete the file from the server
    const imagePath = path.join(process.cwd(), patient.profilePicture);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Wipe the string from the database
    patient.profilePicture = "";
    await patient.save();

    res.status(200).json({ success: true, message: "Profile picture removed successfully" });
  } catch (error) {
    console.error("Delete Picture Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete profile picture" });
  }
};