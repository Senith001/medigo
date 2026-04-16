import { body, param } from "express-validator";

const createSessionValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("patientName").notEmpty().withMessage("Patient name is required"),
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("doctorName").notEmpty().withMessage("Doctor name is required"),
  body("scheduledAt")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("scheduledAt must be a valid ISO8601 date."),
];

const sessionIdValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
];

const updateSessionValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
  body("patientName")
    .optional()
    .notEmpty()
    .withMessage("Patient name cannot be empty."),
  body("doctorName")
    .optional()
    .notEmpty()
    .withMessage("Doctor name cannot be empty."),
  body("scheduledAt")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("scheduledAt must be a valid ISO8601 date."),
];

const updateSessionStatusValidation = [
  param("id").notEmpty().withMessage("Session ID is required"),
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["scheduled", "waiting", "active", "ended", "cancelled"])
    .withMessage("Invalid status value."),
];

export {
  createSessionValidation,
  sessionIdValidation,
  updateSessionValidation,
  updateSessionStatusValidation,
};
