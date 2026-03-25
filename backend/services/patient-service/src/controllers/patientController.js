import Patient from "../models/Patient.js";

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
    res.status(500);
    throw new Error(error.message);
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
    res.status(500);
    throw new Error(error.message);
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ authUserId: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
    }

    const allowedFields = [
      "fullName",
      "phone",
      "gender",
      "dateOfBirth",
      "bloodGroup",
      "address",
      "emergencyContactName",
      "emergencyContactPhone"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: patient
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
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
    res.status(500);
    throw new Error(error.message);
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

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
    res.status(500);
    throw new Error(error.message);
  }
};

export const deletePatient = async (req, res) => {
  try {
    // --- 🛡️ DEFENSE IN DEPTH: SECURITY CHECK ---
    // Ensure only platform admins OR the actual account owner can delete this profile.
    const isAuthorized = 
      req.user.role === "admin" || 
      req.user.role === "superadmin" || 
      req.user.userId === req.params.id || 
      req.user._id.toString() === req.params.id;

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: "Security Violation: You are not authorized to delete this profile." 
      });
    }
    // ------------------------------------------

    // Check if the param is a Mongo ID or a custom userId (like P001)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const patient = await Patient.findOne(query);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient profile not found in Patient DB" 
      });
    }

    // Delete the local medical profile
    await patient.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: "Patient profile deleted successfully" 
    });
    
  } catch (error) {
    console.error("Delete Patient Profile Error:", error.message);
    
    // --- 🛡️ CRASH PREVENTION ---
    // Return a clean JSON error instead of throwing a server-crashing Error
    res.status(500).json({ 
      success: false, 
      message: "An unexpected error occurred while deleting the patient profile." 
    });
  }
};