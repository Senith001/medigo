import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.patch("/:id/status", updateDoctor);  // admin status update (uses same handler, body is restricted by caller)
router.delete("/:id", deleteDoctor);

export default router;