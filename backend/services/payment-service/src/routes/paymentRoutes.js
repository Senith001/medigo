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
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Patient creates a Stripe payment.
router.post("/", protect, authorize("patient"), createPayment);

// Patient submits bank transfer payment + slip
router.post(
  "/bank-transfer",
  protect,
  authorize("patient"),
  upload.single("paymentSlip"),
  createBankTransferPayment
);

// Stripe callback routes
router.get("/success", handlePaymentSuccess);
router.get("/cancel", handlePaymentCancel);

// Admin bank transfer verification routes
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  getPendingBankTransfers
);

router.put(
  "/:id/approve",
  protect,
  authorize("admin"),
  approveBankTransferPayment
);

router.put(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectBankTransferPayment
);

// Patient/admin history routes
router.get(
  "/patient/:patientId",
  protect,
  authorize("patient", "admin"),
  getPaymentsByPatient
);

router.get(
  "/:id",
  protect,
  authorize("patient", "admin"),
  getPaymentById
);

module.exports = router;
