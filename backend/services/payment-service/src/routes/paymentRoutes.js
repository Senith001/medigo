const express = require("express");
const router = express.Router();

const {
  createPayment,
  createBankTransferPayment,
  handlePaymentSuccess,
  handlePaymentCancel,
  getPaymentById,
  getPaymentsByPatient,
  getPendingBankTransfers,
  approveBankTransferPayment,
  rejectBankTransferPayment,
  refundPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const upload = require("../middleware/upload");

const {
  createPaymentValidation,
  createBankTransferValidation,
  paymentIdValidation,
  rejectPaymentValidation,
  refundPaymentValidation,
} = require("../validators/paymentValidators");

// Patient creates a Stripe payment session.
router.post(
  "/",
  protect,
  authorize("patient"),
  createPaymentValidation,
  validate,
  createPayment
);

// Patient submits a bank transfer payment with an uploaded slip.
router.post(
  "/bank-transfer",
  protect,
  authorize("patient"),
  upload.single("paymentSlip"),
  createBankTransferValidation,
  validate,
  createBankTransferPayment
);

// Stripe callback routes stay open.
router.get("/success", handlePaymentSuccess);
router.get("/cancel", handlePaymentCancel);

// Admin gets bank transfers waiting for verification.
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  getPendingBankTransfers
);

// Admin approves a pending bank transfer payment.
router.put(
  "/:id/approve",
  protect,
  authorize("admin"),
  paymentIdValidation,
  validate,
  validateObjectId("id"),
  approveBankTransferPayment
);

// Admin rejects a pending bank transfer payment.
router.put(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectPaymentValidation,
  validate,
  validateObjectId("id"),
  rejectBankTransferPayment
);

// Admin refunds a paid payment.
router.put(
  "/:id/refund",
  protect,
  authorize("admin"),
  refundPaymentValidation,
  validate,
  validateObjectId("id"),
  refundPayment
);

// Patient or admin gets billing history for a patient.
router.get(
  "/patient/:patientId",
  protect,
  authorize("patient", "admin"),
  getPaymentsByPatient
);

// Patient gets own payment by id, admin can get any.
router.get(
  "/:id",
  protect,
  authorize("patient", "admin"),
  paymentIdValidation,
  validate,
  validateObjectId("id"),
  getPaymentById
);

module.exports = router;
