import express from "express";
import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatientId,
  updatePrescription,
  deletePrescription
} from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", createPrescription);
router.get("/", getAllPrescriptions);
router.get("/patient/:patientId", getPrescriptionsByPatientId);
router.get("/:id", getPrescriptionById);
router.put("/:id", updatePrescription);
router.delete("/:id", deletePrescription);

export default router;