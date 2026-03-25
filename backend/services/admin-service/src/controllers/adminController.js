import Admin from "../models/Admin.js";
import httpClient from "../utils/httpClient.js";
import generateToken from "../utils/generateToken.js";

const internalHeaders = {
  headers: { "x-service-secret": process.env.SERVICE_SECRET }
};

// Proxies the login request to Auth Service to ensure admins can log in via the Admin URL
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Call Auth Service to verify credentials
    const response = await httpClient.post(`${process.env.AUTH_SERVICE_URL}/api/auth/login`, { email, password });
    
    // Ensure the user trying to log in is actually an admin
    if (response.data.data.role !== "admin" && response.data.data.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied. Not an admin." });
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Login failed"
    });
  }
};

export const bootstrapSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    if (req.headers["x-admin-super-key"] !== process.env.ADMIN_SUPER_KEY) {
      return res.status(403).json({ success: false, message: "Invalid admin super key" });
    }

    // 1. Create Identity in Auth Service
    let authUser;
    try {
      const authResponse = await httpClient.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users`,
        { fullName, email, password, role: "superadmin" },
        internalHeaders
      );
      authUser = authResponse.data.data;
    } catch (err) {
      return res.status(400).json({ success: false, message: err.response?.data?.message || "Auth service error" });
    }

    // 2. Create Profile in Admin Service
    const superadmin = await Admin.create({
      authUserId: authUser._id,
      userId: authUser.userId,
      fullName: authUser.fullName,
      email: authUser.email,
      role: "superadmin"
    });

    res.status(201).json({
      success: true,
      message: "Superadmin created successfully",
      token: generateToken(authUser),
      data: superadmin
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 🛡️ Pre-Check: See if the admin already exists locally before calling Auth Service
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: "An admin with this email already exists." 
      });
    }

    let authUser;
    try {
      const authResponse = await httpClient.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users`,
        { fullName, email, password, phone, role: "admin" },
        internalHeaders
      );
      authUser = authResponse.data.data;
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.response?.data?.message || "Auth service error" 
      });
    }

    const admin = await Admin.create({
      authUserId: authUser._id,
      userId: authUser.userId,
      fullName: authUser.fullName,
      email: authUser.email,
      phone: authUser.phone,
      role: "admin"
    });

    res.status(201).json({ 
      success: true, 
      message: "Admin created successfully", 
      data: admin 
    });
    
  } catch (error) {
    console.error("Create Admin Error:", error);

    // 🛡️ Handle MongoDB Duplicate Key Error (E11000) gracefully
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Duplicate entry detected. This record already exists." 
      });
    }

    // 🛡️ Return JSON instead of throwing an error to prevent server crash
    res.status(500).json({ 
      success: false, 
      message: "An unexpected error occurred while creating the admin." 
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch admins");
  }
};

// Fetches patients from the Auth Service
export const getPatients = async (req, res) => {
  try {
    const response = await httpClient.get(`${process.env.AUTH_SERVICE_URL}/api/auth/internal/users?role=patient`, internalHeaders);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch patients");
  }
};


// ==========================================
// DELETION ORCHESTRATORS
// ==========================================

export const deleteAdminAccount = async (req, res) => {
  try {
    // --- 🛡️ DEFENSE IN DEPTH: STRICT SECURITY CHECKS ---
    
    // 1. Hard block: Only Superadmins can execute this function
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ 
        success: false, 
        message: "Security Violation: Only Superadmins can delete admin accounts." 
      });
    }

    // 2. Prevent self-deletion: A Superadmin cannot delete themselves
    if (req.user.userId === req.params.id || req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        success: false, 
        message: "Action Denied: You cannot delete your own account." 
      });
    }
    // ---------------------------------------------------

    // Check if the ID is a MongoDB _id or your custom userId (e.g., A002)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const admin = await Admin.findOne(query);
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Tell Auth Service to delete the master identity
    await httpClient.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${admin.authUserId}`,
      internalHeaders
    );

    // Delete the local profile
    await admin.deleteOne();

    res.status(200).json({ success: true, message: "Admin account fully deleted" });
  } catch (error) {
    console.error("Delete Admin Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || "Failed to delete admin" 
    });
  }
};


export const deletePatientAccount = async (req, res) => {
  try {
    const targetUserId = req.params.id; // This will now be "P001"

    // 1. Tell Auth Service to delete the master identity
    await httpClient.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${targetUserId}`,
      internalHeaders
    );

    // 2. Tell Patient Service to delete the medical profile
    await httpClient.delete(
      `http://localhost:5002/api/patients/${targetUserId}`, 
      { headers: { Authorization: req.headers.authorization } }
    ).catch(err => console.log("Note: Patient profile may not exist yet or was already deleted"));

    res.status(200).json({ success: true, message: "Patient account fully deleted" });
  } catch (error) {
    console.error("Delete Patient Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || "Failed to delete patient" 
    });
  }
};