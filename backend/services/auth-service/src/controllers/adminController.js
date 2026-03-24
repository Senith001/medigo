import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const bootstrapSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const superKey = req.headers["x-admin-super-key"];

    if (superKey !== process.env.ADMIN_SUPER_KEY) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin super key"
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const superadmin = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: "superadmin",
      isVerified: true
    });

    const token = generateToken(superadmin);

    res.status(201).json({
      success: true,
      message: "Superadmin created successfully",
      token,
      data: {
        userId: superadmin.userId,
        email: superadmin.email,
        role: superadmin.role
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Password validation intentionally omitted here per your requirements
    const admin = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      role: "admin",
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        userId: admin.userId,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// --- NEW SEPARATED VIEW FUNCTIONS ---

export const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");

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

export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("-password");

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ------------------------------------

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};