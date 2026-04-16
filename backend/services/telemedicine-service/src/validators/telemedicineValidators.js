import { body, param } from "express-validator";

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

export {
  createSessionValidation,
  createSessionFromAppointmentValidation,
  sessionIdValidation,
  syncAppointmentUpdateValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
};
