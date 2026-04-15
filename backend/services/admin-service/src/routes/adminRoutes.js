import express from "express";
import {
  loginAdmin,
  bootstrapSuperAdmin,
  createAdmin,
  getAdmins,
  getPatients,
  getPatientById,
  deleteAdminAccount,
  deletePatientAccount,
  getDoctors,
  updateDoctorStatus,
  toggleAdminStatus
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public / Bootstrap
router.post("/login", loginAdmin);
router.post("/bootstrap-superadmin", bootstrapSuperAdmin);

// Protected Admin Routes
router.post("/create", protect, authorize("superadmin"), createAdmin);
router.get("/list", protect, authorize("superadmin"), getAdmins);
router.patch("/admins/:id/status", protect, authorize("superadmin"), toggleAdminStatus);
router.get("/patients", protect, authorize("admin", "superadmin"), getPatients);
router.get("/patients/:id", protect, authorize("admin", "superadmin"), getPatientById);

router.delete("/admins/:id", protect, authorize("superadmin"), deleteAdminAccount);
router.delete("/patients/:id", protect, authorize("admin", "superadmin"), deletePatientAccount);

// Doctor Management
router.get("/doctors", protect, authorize("admin", "superadmin"), getDoctors);
router.patch("/doctors/:id/status", protect, authorize("admin", "superadmin"), updateDoctorStatus);

export default router;