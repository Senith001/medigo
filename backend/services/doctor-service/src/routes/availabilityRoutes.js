import express from "express";
import {
  createAvailability,
  getAllAvailability,
  getAvailabilityByDoctorId,
  updateAvailability,
  deleteAvailability
} from "../controllers/availabilityController.js";

const router = express.Router();

router.post("/", createAvailability);
router.get("/", getAllAvailability);
router.get("/doctor/:doctorId", getAvailabilityByDoctorId);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

export default router;