import express from "express";
import {
  registerPatient,
  verifyRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register/patient", registerPatient);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

export default router;