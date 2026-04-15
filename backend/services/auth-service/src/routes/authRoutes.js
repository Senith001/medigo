import express from "express";
import {
  registerPatient,
  verifyRegistrationOtp,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  requestDeleteOtp,
  deleteMyAccount,
  createInternalUser,
  getInternalUsersByRole,
  deleteInternalIdentity,
  updateInternalUser,
} from "../controllers/authController.js";
import { protect, authorize, verifyInternalService } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register/patient", registerPatient);
router.post("/verify-otp", verifyRegistrationOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", protect, changePassword);
router.get("/me", protect, getMe);

// Patient self-account deletion
router.post("/me/request-delete-otp", protect, authorize("patient"), requestDeleteOtp);
router.delete("/me", protect, authorize("patient"), deleteMyAccount);

// --- INTERNAL ROUTES (Server-to-Server Only) ---
router.post("/internal/users", verifyInternalService, createInternalUser);
router.get("/internal/users", verifyInternalService, getInternalUsersByRole);
router.delete("/internal/identities/:id", verifyInternalService, deleteInternalIdentity);
router.put("/internal/users/:id", verifyInternalService, updateInternalUser);

export default router;