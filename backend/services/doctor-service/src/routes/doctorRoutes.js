import express from "express";
import {
  createProfileInternal,
  deleteProfileInternal,
  deleteMyProfile,
  getMyProfile,
  updateMyProfile,
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  updateDoctorStatus,
  deleteDoctor,
  getDoctorByEmail
} from "../controllers/doctorController.js";
import {
  addAvailability,
  getAvailability,
  deleteAvailability
} from "../controllers/availabilityController.js";
import { protect, authorize, verifyInternalService } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ─── Internal service-to-service routes (service secret, no JWT) ──────────────
router.post("/internal/create-profile", verifyInternalService, createProfileInternal);
router.delete("/internal/delete-profile", verifyInternalService, deleteProfileInternal);

// Status update is called from admin-service (internal proxy — uses service secret)
router.patch("/:id/status", verifyInternalService, updateDoctorStatus);

// ─── Doctor's own authenticated routes ────────────────────────────────────────
// NOTE: /me must be declared BEFORE /:id to avoid Express matching "me" as an ID
router.get("/me", protect, authorize("doctor"), getMyProfile);
router.put("/me", protect, authorize("doctor"), updateMyProfile);
router.delete("/me", protect, authorize("doctor"), deleteMyProfile);

// ─── Public routes (patients searching for doctors) ───────────────────────────
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.get("/profile/:email", getDoctorByEmail);

// ─── Admin-only routes (JWT with admin role) ──────────────────────────────────
router.post("/", protect, authorize("admin", "superadmin"), createDoctor);
router.put("/:id", protect, authorize("admin", "superadmin"), updateDoctor);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteDoctor);

// Availability Routes
router.post("/:doctorId/availability", addAvailability);
router.get("/:doctorId/availability", getAvailability);
router.delete("/availability/:id", deleteAvailability);

export default router;