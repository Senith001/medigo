import { body, param } from "express-validator";

// Validation rules for Stripe payment creation.
const createPaymentValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
];

// Validation rules for bank transfer payment creation.
const createBankTransferValidation = [
  body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
  body("transferReference")
    .optional()
    .isString()
    .withMessage("Transfer reference must be a string"),
];

// Validation for routes that require a payment id.
const paymentIdValidation = [
  param("id").notEmpty().withMessage("Payment ID is required"),
];

// Validation for rejecting a bank transfer payment.
const rejectPaymentValidation = [
  param("id").notEmpty().withMessage("Payment ID is required"),
  body("rejectionReason")
    .optional()
    .isString()
    .withMessage("Rejection reason must be a string"),
];

const refundPaymentValidation = [
  param("id").notEmpty().withMessage("Payment ID is required"),
  body("refundReason")
    .optional()
    .isString()
    .withMessage("Refund reason must be a string"),
];

export {
  createPaymentValidation,
  createBankTransferValidation,
  paymentIdValidation,
  rejectPaymentValidation,
  refundPaymentValidation,
};
