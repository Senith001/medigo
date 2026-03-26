import express from "express";
import {
  createProfileInternal,
  deleteProfileInternal,
  getMyProfile,
  updateMyProfile,
  getAllPatients,
  getPatientById,
  deletePatient,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/patientController.js";
import {
  protect,
  authorize,
  verifyInternalService
} from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/internal/create-profile", verifyInternalService, createProfileInternal);
router.delete("/internal/delete-profile", verifyInternalService, deleteProfileInternal);

router.get("/me", protect, authorize("patient"), getMyProfile);
router.put("/me", protect, authorize("patient"), updateMyProfile);

// Profile Picture Routes
router.post("/me/profile-picture", protect, authorize("patient"), upload.single("image"), uploadProfilePicture);
router.delete("/me/profile-picture", protect, authorize("patient"), deleteProfilePicture);

router.get("/", protect, authorize("admin", "superadmin"), getAllPatients);
router.get("/:id", protect, authorize("admin", "superadmin"), getPatientById);
router.delete("/:id", protect, authorize("admin", "superadmin"), deletePatient);

export default router;