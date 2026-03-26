const Payment = require("../models/Payment");
const mongoose = require("mongoose");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const {
  createCheckoutSession,
  retrieveCheckoutSession,
} = require("../services/stripeService");

const createPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      amount,
    } = req.body;

    if (
      !appointmentId ||
      !patientId ||
      !patientName ||
      !patientEmail ||
      !doctorId ||
      !doctorName ||
      amount === undefined
    ) {
      return res.status(400).json({
        message: "All required payment fields must be provided.",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero.",
      });
    }

    const invoiceNumber = generateInvoiceNumber();

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      "http://localhost:5173/payment-success";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ||
      "http://localhost:5173/payment-cancel";

    const stripeSession = await createCheckoutSession({
      appointmentId,
      doctorName,
      amount: Number(amount),
      currency: "lkr",
      successUrl,
      cancelUrl,
    });

    const payment = await Payment.create({
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      amount: Number(amount),
      currency: "LKR",
      paymentMethod: "stripe",
      status: "pending",
      invoiceNumber,
      stripeSessionId: stripeSession.id,
    });

    return res.status(201).json({
      message: "Payment session created successfully.",
      payment,
      checkoutUrl: stripeSession.url,
    });
  } catch (error) {
    console.error("createPayment error:", error.message);

    return res.status(500).json({
      message: "Server error while creating payment session.",
    });
  }
};

const handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Stripe session ID is required." });
    }

    const stripeSession = await retrieveCheckoutSession(session_id);

    const payment = await Payment.findOne({ stripeSessionId: session_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    if (stripeSession.payment_status === "paid") {
      payment.status = "paid";
      payment.paidAt = new Date();
      payment.stripePaymentIntentId = stripeSession.payment_intent || null;
      payment.failureReason = null;
      await payment.save();
    }

    res.status(200).json({
      message: "Payment marked as successful.",
      payment,
    });
  } catch (error) {
    console.error("handlePaymentSuccess error:", error.message);
    res.status(500).json({
      message: "Server error while processing payment success.",
    });
  }
};

const handlePaymentCancel = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Stripe session ID is required." });
    }

    const payment = await Payment.findOne({ stripeSessionId: session_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    payment.status = "cancelled";
    payment.failureReason = "Payment was cancelled by the user.";
    await payment.save();

    res.status(200).json({
      message: "Payment marked as cancelled.",
      payment,
    });
  } catch (error) {
    console.error("handlePaymentCancel error:", error.message);
    res.status(500).json({
      message: "Server error while processing payment cancellation.",
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid payment ID." });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.error("getPaymentById error:", error.message);

    return res.status(500).json({ message: "Server error fetching payment." });
  }
};

const getPaymentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const payments = await Payment.find({ patientId }).sort({ createdAt: -1 });

    return res.status(200).json({
      total: payments.length,
      payments,
    });
  } catch (error) {
    console.error("getPaymentsByPatient error:", error.message);

    return res.status(500).json({
      message: "Server error fetching billing history.",
    });
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByPatient,
  handlePaymentSuccess,
  handlePaymentCancel,
};
