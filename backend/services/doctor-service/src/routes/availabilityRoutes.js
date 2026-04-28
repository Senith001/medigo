import express from "express";
import {
  createAvailability,
  getAllAvailability,
  getAvailabilityByDoctorId,
  updateAvailability,
  deleteAvailability,
  internalUpdateOccupancy
} from "../controllers/availabilityController.js";

const router = express.Router();

router.post("/", createAvailability);
router.get("/", getAllAvailability);
router.get("/doctor/:doctorId", getAvailabilityByDoctorId);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

// Internal: called by appointment-service to increment/decrement bookedCount
router.put("/internal/:id/occupancy", internalUpdateOccupancy);

export default router;