import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
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

router.post("/", upload.single("reportFile"), createReport);
router.get("/", getAllReports);
router.get("/patient/:patientId", getReportsByPatientId);
router.get("/doctor/:doctorId", getReportsByDoctorId);
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

export default router;