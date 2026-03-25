import express from "express";
import {
  registerPatient,
  verifyRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  createInternalUser,      
  getInternalUsersByRole,  
  deleteInternalUser       
} from "../controllers/authController.js";
import { protect, verifyInternalService } from "../middlewares/authMiddleware.js"; // Import internal checker

const router = express.Router();

router.post("/register/patient", registerPatient);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

// --- INTERNAL ROUTES (Server-to-Server Only) ---
router.post("/internal/users", verifyInternalService, createInternalUser);
router.get("/internal/users", verifyInternalService, getInternalUsersByRole);
router.delete("/internal/users/:id", verifyInternalService, deleteInternalUser);

export default router;