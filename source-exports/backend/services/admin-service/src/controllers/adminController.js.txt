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

    const response = await httpClient.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/login`,
      { email, password }
    );

    if (
      response.data.data.role !== "admin" &&
      response.data.data.role !== "superadmin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an admin."
      });
    }

    const adminCheck = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!adminCheck) {
      return res.status(403).json({
        success: false,
        message: "Admin profile not found in Admin Service."
      });
    }

    if (!adminCheck.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account disabled. Please contact the super admin."
      });
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
      return res.status(403).json({
        success: false,
        message: "Invalid admin super key"
      });
    }

    let authUser;
    try {
      const authResponse = await httpClient.post(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users`,
        { fullName, email, password, role: "superadmin" },
        internalHeaders
      );
      authUser = authResponse.data.data;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.response?.data?.message || "Auth service error"
      });
    }

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
      return res.status(500).json({ success: false, message: error.message });
    }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;

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
        { fullName, email, phone, role: "admin" },
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
      role: "admin",
      isActive: false  // Stays inactive until they set their password
    });

    res.status(201).json({
      success: true,
      message: "Admin invitation sent. They will receive an email to set up their account.",
      data: admin
    });
  } catch (error) {
    console.error("Create Admin Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected. This record already exists."
      });
    }

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the admin."
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    // Added the filter to only match documents where role is "admin"
    const admins = await Admin.find({ role: "admin" });
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch admins");
  }
};

// Called internally by auth-service after a new admin completes password setup
export const activateAdmin = async (req, res) => {
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { authUserId: req.params.id } : { userId: req.params.id };

    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin profile not found." });
    }

    admin.isActive = true;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.fullName} has been activated.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to activate admin." });
  }
};

export const resendAdminInvitation = async (req, res) => {
  try {
    const { adminId } = req.params;

    // First fetch the admin profile to get their email
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(adminId);
    const query = isMongoId ? { _id: adminId } : { userId: adminId };
    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    if (admin.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot resend invitation to an already active admin."
      });
    }

    // Proxy to auth-service which handles token generation and email
    await httpClient.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/resend-admin-invitation`,
      { email: admin.email },
      internalHeaders
    );

    res.status(200).json({
      success: true,
      message: `Invitation resent to ${admin.email}.`
    });
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to resend invitation.";
    res.status(error.response?.status || 500).json({ success: false, message: msg });
  }
};

export const toggleAdminStatus = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmins can toggle admin status."
      });
    }

    if (req.user.userId === req.params.id || req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own status."
      });
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.fullName} has been ${admin.isActive ? 'enabled' : 'disabled'}.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update admin status." });
  }
};

// Fetches patients from the Auth Service
export const getPatients = async (req, res) => {
  try {
    const response = await httpClient.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users?role=patient`,
      internalHeaders
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch patients");
  }
};

// ============================================
// GET PATIENT BY ID - CALL PATIENT CONTROLLER
// ============================================

export const getPatientById = async (req, res) => {
  try {
    const targetId = req.params.id;
    const response = await httpClient.get(
      `${process.env.PATIENT_SERVICE_URL}/api/patients/${targetId}`,
      {
        headers: {
          Authorization: req.headers.authorization
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch patient details"
    });
  }
};

// ==========================================
// DOCTOR MANAGEMENT
// ==========================================

export const getDoctors = async (req, res) => {
  try {
    const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL;
    if (!doctorServiceUrl) {
      return res.status(500).json({
        success: false,
        message: "Admin service misconfiguration: DOCTOR_SERVICE_URL is not defined."
      });
    }

    const response = await httpClient.get(
      `${doctorServiceUrl}/api/doctors`
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch doctors"
    });
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value. Must be pending, verified, or rejected." });
    }

    // Step 1: Update the doctor's status in doctor-service
    const doctorResponse = await httpClient.patch(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/${req.params.id}/status`,
      { status },
      internalHeaders  // service secret
    );

    const doctor = doctorResponse.data?.data;

    // Step 2: Sync isVerified in auth-service and fire email
    // Only act on terminal states
    if (status === 'verified' || status === 'rejected') {
      try {
        await httpClient.patch(
          `${process.env.AUTH_SERVICE_URL}/api/auth/internal/doctors/${doctor?.authUserId || req.params.id}/verify`,
          { approve: status === 'verified' },
          internalHeaders
        );
      } catch (authErr) {
        console.error("Failed to sync doctor verification in auth-service:", authErr.message);
        // Non-fatal — status is updated in doctor-service, admin can retry
      }
    }

    res.status(200).json(doctorResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to update doctor status"
    });
  }
};

// ==========================================
// DELETION ORCHESTRATORS
// ==========================================

export const deleteAdminAccount = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Security Violation: Only Superadmins can delete admin accounts."
      });
    }

    if (
      req.user.userId === req.params.id ||
      req.user._id.toString() === req.params.id
    ) {
      return res.status(400).json({
        success: false,
        message: "Action Denied: You cannot delete your own account."
      });
    }

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    await httpClient.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/identities/${admin.authUserId}`,
      internalHeaders
    );

    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: "Admin account fully deleted"
    });
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
    const targetId = req.params.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetId);

    // 1. Delete patient profile from Patient Service first
    try {
      await httpClient.delete(
        `${process.env.PATIENT_SERVICE_URL}/api/patients/internal/delete-profile`,
        {
          headers: {
            "x-service-secret": process.env.SERVICE_SECRET
          },
          data: isMongoId ? { authUserId: targetId } : { userId: targetId }
        }
      );
    } catch (serviceError) {
      const status = serviceError.response?.status;

      if (status !== 404) {
        return res.status(status || 500).json({
          success: false,
          message:
            serviceError.response?.data?.message || "Failed to delete patient profile"
        });
      }
    }

    // 2. Delete Auth identity + OTP records
    await httpClient.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/identities/${targetId}`,
      internalHeaders
    );

    res.status(200).json({
      success: true,
      message: "Patient account fully deleted"
    });
  } catch (error) {
    console.error("Delete Patient Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to delete patient"
    });
  }
};

export const deleteDoctorAccount = async (req, res) => {
  try {
    const targetId = req.params.id;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetId);

    // 1. Delete doctor profile from Doctor Service first
    try {
      await httpClient.delete(
        `${process.env.DOCTOR_SERVICE_URL}/api/doctors/internal/${targetId}`,
        {
          headers: {
            "x-service-secret": process.env.SERVICE_SECRET
          }
        }
      );
    } catch (serviceError) {
      const status = serviceError.response?.status;
      if (status !== 404) {
        return res.status(status || 500).json({
          success: false,
          message: serviceError.response?.data?.message || "Failed to delete doctor profile"
        });
      }
    }

    // 2. Delete Auth identity + OTP records
    await httpClient.delete(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/identities/${targetId}`,
      internalHeaders
    );

    res.status(200).json({
      success: true,
      message: "Doctor account fully deleted"
    });
  } catch (error) {
    console.error("Delete Doctor Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Failed to delete doctor"
    });
  }
};