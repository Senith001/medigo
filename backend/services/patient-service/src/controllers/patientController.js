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
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully"
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};