const express = require("express");
const router = express.Router();
const {
  createPayment,
  handlePaymentSuccess,
  handlePaymentCancel,
  getPaymentById,
  getPaymentsByPatient,
} = require("../controllers/paymentController");

router.post("/", createPayment);
router.get("/success", handlePaymentSuccess);
router.get("/cancel", handlePaymentCancel);
router.get("/patient/:patientId", getPaymentsByPatient);
router.get("/:id", getPaymentById);

module.exports = router;