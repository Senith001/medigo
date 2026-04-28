import express from "express";
import validate from "../middleware/validate.js";
import validateObjectId from "../middleware/validateObjectId.js";
import {
  createSessionValidation,
  createSessionFromAppointmentValidation,
  sessionIdValidation,
  syncAppointmentUpdateValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
  validateJoinSessionWindow,
} from "../validators/telemedicineValidators.js";

import {
  createSession,
  createSessionFromAppointment,
  getMySessions,
  getAllSessions,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
  syncAppointmentUpdate,
} from "../controllers/telemedicineController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const verifyInternalService = (req, res, next) => {
  const secret = req.headers["x-service-secret"];

  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({
      message: "Unauthorized internal service call.",
    });
  }

  return next();
};

// Appointment-service can call this when a telemedicine appointment changes.
router.put(
  "/internal/appointment-updated",
  verifyInternalService,
  syncAppointmentUpdateValidation,
  validate,
  syncAppointmentUpdate
);

// Appointment-service can call this when a paid telemedicine appointment is confirmed.
router.post(
  "/internal/from-appointment",
  verifyInternalService,
  createSessionFromAppointmentValidation,
  validate,
  createSessionFromAppointment
);

// Create a new telemedicine session for an appointment.
router.post(
  "/",
  protect,
  authorize("doctor", "admin"),
  createSessionValidation,
  validate,
  createSession
);

// Admin gets all telemedicine sessions.
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllSessions
);

// Patient/doctor/admin gets sessions from telemedicine DB for the current account.
router.get(
  "/",
  protect,
  authorize("patient", "doctor", "admin"),
  getMySessions
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
  validateJoinSessionWindow,
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
