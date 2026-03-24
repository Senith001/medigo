import express from "express";
import {
  createProfileInternal,
  getMyProfile,
  updateMyProfile,
  getAllPatients,
  getPatientById,
  deletePatient
} from "../controllers/patientController.js";
import {
  protect,
  authorize,
  verifyInternalService
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/internal/create-profile", verifyInternalService, createProfileInternal);

router.get("/me", protect, authorize("patient"), getMyProfile);
router.put("/me", protect, authorize("patient"), updateMyProfile);

router.get("/", protect, authorize("admin", "superadmin"), getAllPatients);
router.get("/:id", protect, authorize("admin", "superadmin"), getPatientById);
router.delete("/:id", protect, authorize("admin", "superadmin"), deletePatient);

export default router;