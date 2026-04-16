import { body, param } from "express-validator";

// Rules for creating a new telemedicine session.
const createSessionValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("patientName").notEmpty().withMessage("Patient name is required"),
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("doctorName").notEmpty().withMessage("Doctor name is required"),
  body("type")
    .equals("telemedicine")
    .withMessage("Only telemedicine appointments can create a session"),
  body("scheduledAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("scheduledAt must be a valid date"),
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
  sessionIdValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
};
