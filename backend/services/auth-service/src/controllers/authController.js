import User from "../models/User.js";
import Otp from "../models/Otp.js";
import generateOtp from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import { sendOtpEmail, sendSimpleEmail } from "../utils/email.js";
import httpClient from "../utils/httpClient.js";
import { validatePatientRegistration, validatePassword } from "../utils/validators.js"; 

//============================================
//           REGISTER PATIENT
//============================================

export const registerPatient = async (req, res) => {
  try {
    const { isValid, errors } = validatePatientRegistration(req.body);

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid input data", errors });
    }

    const { fullName, email, password, phone } = req.body;

    // 1. Find the user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // 2. Are they already fully registered? Block them.
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in."
        });
      } 
      // 3. THE MAGIC FIX: They exist but aren't verified!
      // Update their details with the newest form submission just in case they made a typo earlier.
      else {
        user.fullName = fullName;
        user.password = password; // Mongoose will automatically re-hash this because of your pre('save') hook!
        user.phone = phone;
        await user.save();
        
        // We don't return an error. We let the code continue down below to generate a new OTP!
      }
    } else {
      // 4. They don't exist at all. Create a brand new user.
      user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        phone,
        role: "patient",
        isVerified: false
      });
    }

    // --- The rest of your code remains exactly the same! ---
    // It will delete old OTPs, generate a new one, and email it.
    await Otp.deleteMany({
      userId: user._id,
      purpose: "VERIFY_EMAIL",
      usedAt: null
    });

    const otp = generateOtp();

    await Otp.create({
      userId: user._id,
      purpose: "VERIFY_EMAIL",
      otpCode: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOtpEmail(user.email, "Verify your MEDIGO account", otp);

    res.status(201).json({
      success: true,
      message: "Registration initiated. Fresh OTP sent to email.",
      data: { userId: user.userId, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};


//============================================
//             OTP Verification
//============================================

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Find the latest unused OTP record for this user (Do not search by otpCode anymore)
    const otpRecord = await Otp.findOne({
      userId: user._id,
      purpose: "VERIFY_EMAIL",
      usedAt: null
    }).sort({ createdAt: -1 }); // Get the most recently generated one

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No active OTP found. Please request a new one." });
    }

    // 2. Check expiration BEFORE running the heavy bcrypt comparison
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // 3. Use bcrypt to compare the plain text OTP with the hashed DB record
    const isMatch = await otpRecord.compareOtp(otp);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    await user.save();

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    try {
      await httpClient.post(
        `${process.env.PATIENT_SERVICE_URL}/api/patients/internal/create-profile`,
        {
          authUserId: user._id,
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone
        },
        {
          headers: {
            "x-service-secret": process.env.SERVICE_SECRET 
          }
        }
      );
    } catch (serviceError) {
      console.error("Patient profile creation failed:", serviceError.message);
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token,
      data: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before login"
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = generateOtp();

    await Otp.deleteMany({
      userId: user._id,
      purpose: "RESET_PASSWORD",
      usedAt: null
    });

    await Otp.create({
      userId: user._id,
      purpose: "RESET_PASSWORD",
      otpCode: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await sendOtpEmail(user.email, "MEDIGO Password Reset OTP", otp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent"
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

//=================================================
//                Reset Password
//=================================================

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be more than 8 characters and contain at least one uppercase, one lowercase, one number, and one special character"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Find the latest unused reset OTP record for this user
    const otpRecord = await Otp.findOne({
      userId: user._id,
      purpose: "RESET_PASSWORD",
      usedAt: null
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No active password reset request found." });
    }

    // 2. Check expiration
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // 3. Compare the hashed OTP
    const isMatch = await otpRecord.compareOtp(otp);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.password = newPassword;
    await user.save();

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    await sendSimpleEmail(
      user.email,
      "MEDIGO Password Changed",
      "Your password has been reset successfully."
    );

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // --- NEW VALIDATION BLOCK ---
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be more than 8 characters and contain at least one uppercase, one lowercase, one number, and one special character"
      });
    }
    // ----------------------------

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    await sendSimpleEmail(
      user.email,
      "MEDIGO Password Changed",
      "Your password has been changed successfully."
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};


// ==========================================
// INTERNAL SERVICE METHODS (For Admin Service)
// ==========================================

export const createInternalUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      role,
      isVerified: true // Admins do not need OTPs
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const getInternalUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.find({ role }).select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const deleteInternalUser = async (req, res) => {
  try {
    // Check if the param is a Mongo ID or a custom userId (like P001)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { userId: req.params.id };

    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in Auth DB" });
    }
    
    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};