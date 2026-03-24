import express from "express";
import {
  bootstrapSuperAdmin,
  createAdmin,
  getPatients,
  getDoctors,
  getAdmins,
  deleteUser
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Creation
router.post("/bootstrap-superadmin", bootstrapSuperAdmin);
router.post("/create-admin", protect, authorize("superadmin"), createAdmin);

// Separate Read Routes (Normal admins and Superadmins can view patients & doctors)
router.get("/patients", protect, authorize("admin", "superadmin"), getPatients);
router.get("/doctors", protect, authorize("admin", "superadmin"), getDoctors);

// Separate Read Route (ONLY Superadmins can view other admins)
router.get("/admins", protect, authorize("superadmin"), getAdmins);

// Deletion
router.delete("/users/:id", protect, authorize("admin", "superadmin"), deleteUser);

export default router;