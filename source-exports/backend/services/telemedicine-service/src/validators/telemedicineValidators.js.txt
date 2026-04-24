import { body, param } from "express-validator";
import TelemedicineSession from "../models/TelemedicineSession.js";

const TELEMEDICINE_PREJOIN_MINUTES = 30;
const LEGACY_FALLBACK_DURATION_MINUTES = 30;

// Parse HH:mm or HH:mm AM/PM into minutes from midnight.
const parseTimeToMinutes = (value) => {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  } else if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }

  if (hours < 0 || hours > 23) {
    return null;
  }

  return hours * 60 + minutes;
};

const getDurationMinutesFromTimeSlot = (timeSlot) => {
  const [startRaw, endRaw] = String(timeSlot || "").split("-");

  if (!startRaw || !endRaw) {
    return null;
  }

  const startMinutes = parseTimeToMinutes(startRaw);
  const endMinutes = parseTimeToMinutes(endRaw);

  if (startMinutes === null || endMinutes === null) {
    return null;
  }

  let durationMinutes = endMinutes - startMinutes;

  if (durationMinutes <= 0) {
    durationMinutes += 24 * 60;
  }

  return durationMinutes;
};

// Rules for creating a new telemedicine session.
const createSessionValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
];

// Rules for appointment-service creating a session internally.
const createSessionFromAppointmentValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
];

// Rules for syncing appointment date/time/status changes into an existing session.
const syncAppointmentUpdateValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
  body("appointmentDate")
    .optional()
    .isISO8601()
    .withMessage("Appointment date must be a valid date"),
  body("timeSlot")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Time slot must be a valid string"),
  body("status")
    .optional()
    .isIn(["confirmed", "cancelled", "completed", "no-show"])
    .withMessage("Invalid appointment status"),
];

// Rules for routes that use a session MongoDB id.
const sessionIdValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
];

// Rules for updating editable session fields.
const updateSessionValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
  body("patientName")
    .optional()
    .isString()
    .withMessage("Patient name must be a string"),
  body("doctorName")
    .optional()
    .isString()
    .withMessage("Doctor name must be a string"),
  body("scheduledAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("scheduledAt must be a valid date"),
];

// Rules for changing the session lifecycle status.
const updateSessionStatusValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
  body("status")
    .isIn(["scheduled", "waiting", "active", "ended", "cancelled"])
    .withMessage("Invalid status"),
];

const validateJoinSessionWindow = async (req, res, next) => {
  try {
    // Use telemedicine DB state only, so join checks still work during appointment-service outages.
    const session = await TelemedicineSession.findById(req.params.id).select(
      "scheduledAt timeSlot"
    );

    if (!session || !session.scheduledAt) {
      return next();
    }

    const start = new Date(session.scheduledAt);

    if (Number.isNaN(start.getTime())) {
      return next();
    }

    const joinAllowedAt = new Date(
      start.getTime() - TELEMEDICINE_PREJOIN_MINUTES * 60 * 1000
    );
    // Keep old sessions joinable even if they were created before timeSlot was persisted.
    const sessionDurationMinutes =
      getDurationMinutesFromTimeSlot(session.timeSlot) ||
      LEGACY_FALLBACK_DURATION_MINUTES;

    const joinUntil = new Date(
      start.getTime() + sessionDurationMinutes * 60 * 1000
    );

    const now = new Date();

    if (now < joinAllowedAt) {
      return res.status(400).json({
        message: `You can join only ${TELEMEDICINE_PREJOIN_MINUTES} minutes before the scheduled session time.`,
        joinAllowedAt,
      });
    }

    if (now > joinUntil) {
      return res.status(400).json({
        message: "Session join window has ended.",
        joinUntil,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error validating session join window.",
    });
  }
};

export {
  createSessionValidation,
  createSessionFromAppointmentValidation,
  sessionIdValidation,
  syncAppointmentUpdateValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
  validateJoinSessionWindow,
};
