import express from "express"
const router = express.Router()

import {
  createPayment,
  createBankTransferPayment,
  handlePaymentSuccess,
  handlePaymentCancel,
  getPaymentById,
  getPaymentsByPatient,
  getPendingBankTransfers,
  getAllBankTransfers,
  approveBankTransferPayment,
  rejectBankTransferPayment,
  refundPayment,
} from "../controllers/paymentController.js"

import { protect, authorize } from "../middleware/auth.js"
import validate from "../middleware/validate.js"
import validateObjectId from "../middleware/validateObjectId.js"
import upload from "../middleware/upload.js"
import {
  createPaymentValidation,
  createBankTransferValidation,
  paymentIdValidation,
  rejectPaymentValidation,
  refundPaymentValidation,
} from "../validators/paymentValidators.js"

// Patient — Stripe session
router.post(
  "/",
  protect,
  authorize("patient"),
  createPaymentValidation,
  validate,
  createPayment
)

// Patient — Bank transfer
router.post(
  "/bank-transfer",
  protect,
  authorize("patient"),
  upload.single("paymentSlip"),
  createBankTransferValidation,
  validate,
  createBankTransferPayment
)

// Stripe callbacks
router.get("/success", handlePaymentSuccess)
router.get("/cancel", handlePaymentCancel)

// ✅ FIXED: /admin/pending → /pending-transfers (no /admin/ in path)
router.get(
  "/pending-transfers",
  protect,
  authorize("admin", "superadmin"),
  getPendingBankTransfers
)

// Admin — all bank transfers (history)
router.get(
  "/all",
  protect,
  authorize("admin", "superadmin"),
  getAllBankTransfers
)

// Admin approve
router.put(
  "/:id/approve",
  protect,
  authorize("admin", "superadmin"),
  paymentIdValidation,
  validate,
  validateObjectId("id"),
  approveBankTransferPayment
)

// Admin reject
router.put(
  "/:id/reject",
  protect,
  authorize("admin", "superadmin"),
  rejectPaymentValidation,
  validate,
  validateObjectId("id"),
  rejectBankTransferPayment
)

// Admin refund
router.put(
  "/:id/refund",
  protect,
  authorize("admin", "superadmin"),
  refundPaymentValidation,
  validate,
  validateObjectId("id"),
  refundPayment
)

// Patient billing history
router.get(
  "/patient/:patientId",
  protect,
  authorize("patient", "admin", "superadmin"),
  getPaymentsByPatient
)

// Single payment
router.get(
  "/:id",
  protect,
  authorize("patient", "admin", "superadmin"),
  paymentIdValidation,
  validate,
  validateObjectId("id"),
  getPaymentById
)

export default router