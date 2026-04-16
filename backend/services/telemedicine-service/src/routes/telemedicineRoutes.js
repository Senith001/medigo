import express from "express";
import validate from "../middleware/validate.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createSessionValidation,
  sessionIdValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
} from "../validators/telemedicineValidators.js";

import {
  createSession,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
} from "../controllers/telemedicineController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Create a new telemedicine session for an appointment.
router.post(
  "/",
  protect,
  authorize("doctor", "admin"),
  createSessionValidation,
  validate,
  createSession
);

// Check whether a session exists for a given appointment.
router.get(
  "/appointment/:appointmentId",
  protect,
  authorize("patient", "doctor", "admin"),
  getSessionByAppointmentId
);

// Get one session by its MongoDB id.
router.get(
  "/:id",
  protect,
  authorize("patient", "doctor", "admin"),
  sessionIdValidation,
  validate,
  validateObjectId("id"),
  getSessionById
);

// Return the meeting link and move a scheduled session to waiting.
router.put(
  "/:id/join",
  protect,
  authorize("patient", "doctor", "admin"),
  sessionIdValidation,
  validate,
  validateObjectId("id"),
  joinSession
);

// Update basic session details before the session starts.
router.put(
  "/:id",
  protect,
  authorize("doctor", "admin"),
  updateSessionValidation,
  validate,
  validateObjectId("id"),
  updateSession
);

// Update the current lifecycle status of a session.
router.put(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updateSessionStatusValidation,
  validate,
  validateObjectId("id"),
  updateSessionStatus
);

// Delete only upcoming sessions.
router.delete(
  "/:id",
  protect,
  authorize("doctor", "admin"),
  sessionIdValidation,
  validate,
  validateObjectId("id"),
  deleteSession
);

export default router;
