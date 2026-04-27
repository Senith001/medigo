import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createReport,
  getAllReports,
  getReportById,
  getReportsByPatientId,
  getReportsByDoctorId,
  updateReport,
  deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", protect, upload.single("reportFile"), createReport);
router.get("/", protect, authorize("admin", "superadmin", "doctor"), getAllReports);
router.get("/patient/:patientId", protect, getReportsByPatientId);
router.get("/doctor/:doctorId", protect, getReportsByDoctorId);
router.get("/:id", protect, getReportById);
router.put("/:id", protect, authorize("doctor", "admin", "superadmin"), updateReport);
router.delete("/:id", protect, authorize("doctor", "admin", "superadmin"), deleteReport);

export default router;
