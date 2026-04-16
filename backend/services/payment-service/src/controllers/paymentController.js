import Payment from "../models/Payment.js";
import axios from "axios";
import generateInvoiceNumber from "../utils/generateInvoiceNumber.js";
import {
  createCheckoutSession,
  retrieveCheckoutSession,
  createRefund,
} from "../services/stripeService.js";

// Helper: sync appointment paymentStatus to appointment-service
const syncAppointmentPayment = async (appointmentId, paymentStatus) => {
  try {
    await axios.put(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/internal/payment-status`,
      { appointmentId, paymentStatus },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET,
        },
      }
    );
  } catch (err) {
    console.error("Failed to sync appointment payment status:", err.message);
  }
};

// Helper: trigger notification-service for payment-related messages
const sendNotification = async (payment, type) => {
  try {
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/internal/payment-status`,
      {
        appointmentId: payment.appointmentId,
        patientName: payment.patientName,
        patientEmail: payment.patientEmail,
        patientPhone: payment.patientPhone || null,
        doctorName: payment.doctorName,
        amount: payment.amount,
        currency: payment.currency,
        invoiceNumber: payment.invoiceNumber,
        type,
      },
      {
        headers: {
          "x-service-secret": process.env.SERVICE_SECRET,
        },
      }
    );
  } catch (err) {
    console.error(`Failed to send ${type} notification:`, err.message);
  }
};

const findBlockingPayment = async (appointmentId, patientId, paymentMethod) => {
  const blockingStatuses = ["pending", "paid", "verification_pending"];

  return Payment.findOne({
    appointmentId,
    patientId,
    paymentMethod,
    status: { $in: blockingStatuses },
  });
};

// Create a Stripe payment and save its details in the database.
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
      !amount
    ) {
      return res.status(400).json({
        message: "All required payment fields must be provided.",
      });
    }

    // Patient can only create payment for themselves
    if (req.user.role === "patient" && req.user.userId !== patientId) {
      return res.status(403).json({
        message: "Access denied. You can only create payments for your own appointments.",
      });
    }

    const existingPayment = await findBlockingPayment(
      appointmentId,
      patientId,
      "stripe"
    );

    if (existingPayment) {
      return res.status(409).json({
        message: "A Stripe payment already exists for this appointment.",
      });
    }

    const invoiceNumber = generateInvoiceNumber();

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      "http://localhost:5007/api/payments/success";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ||
      "http://localhost:5007/api/payments/cancel";

    const stripeSession = await createCheckoutSession({
      appointmentId,
      doctorName,
      amount,
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
      amount,
      currency: "LKR",
      paymentMethod: "stripe",
      status: "pending",
      invoiceNumber,
      stripeSessionId: stripeSession.id,
    });

    res.status(201).json({
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

const createBankTransferPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      amount,
      transferReference,
    } = req.body;

    if (
      !appointmentId ||
      !patientId ||
      !patientName ||
      !patientEmail ||
      !doctorId ||
      !doctorName ||
      !amount
    ) {
      return res.status(400).json({
        message: "All required bank transfer payment fields must be provided.",
      });
    }

    // Patient can only create payment for themselves
    if (req.user.role === "patient" && req.user.userId !== patientId) {
      return res.status(403).json({
        message: "Access denied. You can only submit payments for your own appointments.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Payment slip is required for bank transfer.",
      });
    }

    const existingPayment = await findBlockingPayment(
      appointmentId,
      patientId,
      "bank_transfer"
    );

    if (existingPayment) {
      return res.status(409).json({
        message: "A bank transfer payment already exists for this appointment.",
      });
    }

    const invoiceNumber = generateInvoiceNumber();

    // Save the uploaded slip path so admins can review it later.
    const paymentSlipUrl = `/uploads/payment-slips/${req.file.filename}`;

    const payment = await Payment.create({
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      amount,
      currency: "LKR",
      paymentMethod: "bank_transfer",
      status: "verification_pending",
      invoiceNumber,
      paymentSlipUrl,
      transferReference: transferReference || null,
    });

    // Notify notification-service that bank transfer is awaiting verification
    await sendNotification(payment, "verification_pending");

    res.status(201).json({
      message: "Bank transfer payment submitted successfully and is pending verification.",
      payment,
    });
  } catch (error) {
    console.error("createBankTransferPayment error:", error.message);
    res.status(500).json({
      message: "Server error while submitting bank transfer payment.",
    });
  }
};

const handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "Stripe session ID is required." });
    }

    // Use the Stripe session id to find and update the local payment record.
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

      // Sync appointment payment status to appointment-service
      await syncAppointmentPayment(payment.appointmentId, "paid");

      // Trigger payment confirmation notification
      await sendNotification(payment, "paid");

      return res.status(200).json({
        message: "Payment marked as successful.",
        payment,
      });
    }

    return res.status(400).json({
      message: "Payment is not completed in Stripe.",
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

    const stripeSession = await retrieveCheckoutSession(session_id);

    const payment = await Payment.findOne({ stripeSessionId: session_id });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    if (stripeSession.payment_status === "paid") {
      return res.status(409).json({
        message: "Payment is already completed in Stripe and cannot be cancelled.",
        payment,
      });
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
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Patient can only access their own payment
    if (
      req.user.role !== "admin" &&
      payment.patientId !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("getPaymentById error:", error.message);

    return res.status(500).json({ message: "Server error fetching payment." });
  }
};

const getPaymentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Patient can only access their own billing history
    if (
      req.user.role !== "admin" &&
      req.user.userId !== patientId
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    const payments = await Payment.find({ patientId }).sort({ createdAt: -1 });

    res.status(200).json({
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

const getPendingBankTransfers = async (req, res) => {
  try {
    // Return bank transfer payments that still need admin verification.
    const payments = await Payment.find({
      paymentMethod: "bank_transfer",
      status: "verification_pending",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      total: payments.length,
      payments,
    });
  } catch (error) {
    console.error("getPendingBankTransfers error:", error.message);
    res.status(500).json({
      message: "Server error while fetching pending bank transfer payments.",
    });
  }
};

const approveBankTransferPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.paymentMethod !== "bank_transfer") {
      return res.status(400).json({
        message: "Only bank transfer payments can be approved through this route.",
      });
    }

    if (payment.status !== "verification_pending") {
      return res.status(400).json({
        message: "Only pending verification payments can be approved.",
      });
    }

    // Mark the verified bank transfer as paid.
    payment.status = "paid";
    payment.verifiedBy = req.user.userId;
    payment.verifiedAt = new Date();
    payment.paidAt = new Date();
    payment.rejectionReason = null;
    payment.failureReason = null;

    await payment.save();

    // Sync appointment payment status to appointment-service
    await syncAppointmentPayment(payment.appointmentId, "paid");

    // Trigger approved payment notification
    await sendNotification(payment, "approved");

    res.status(200).json({
      message: "Bank transfer payment approved successfully.",
      payment,
    });
  } catch (error) {
    console.error("approveBankTransferPayment error:", error.message);
    res.status(500).json({
      message: "Server error while approving bank transfer payment.",
    });
  }
};

const rejectBankTransferPayment = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.paymentMethod !== "bank_transfer") {
      return res.status(400).json({
        message: "Only bank transfer payments can be rejected through this route.",
      });
    }

    if (payment.status !== "verification_pending") {
      return res.status(400).json({
        message: "Only pending verification payments can be rejected.",
      });
    }

    payment.status = "rejected";
    payment.verifiedBy = req.user.userId;
    payment.verifiedAt = new Date();
    payment.rejectionReason = rejectionReason || "Payment verification rejected by admin.";

    await payment.save();

    // Trigger rejected payment notification
    await sendNotification(payment, "rejected");

    res.status(200).json({
      message: "Bank transfer payment rejected successfully.",
      payment,
    });
  } catch (error) {
    console.error("rejectBankTransferPayment error:", error.message);
    res.status(500).json({
      message: "Server error while rejecting bank transfer payment.",
    });
  }
};

const refundPayment = async (req, res) => {
  try {
    const { refundReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({
        message: "Payment is already refunded.",
      });
    }

    if (payment.status !== "paid") {
      return res.status(400).json({
        message: "Only paid payments can be refunded.",
      });
    }

    if (payment.paymentMethod === "stripe") {
      if (!payment.stripePaymentIntentId) {
        return res.status(400).json({
          message: "Stripe payment intent is missing for this payment.",
        });
      }

      await createRefund(payment.stripePaymentIntentId);
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    payment.refundReason = refundReason || "Refund processed by admin.";
    payment.failureReason = null;

    await payment.save();

    await syncAppointmentPayment(payment.appointmentId, "refunded");
    await sendNotification(payment, "refunded");

    res.status(200).json({
      message: "Payment refunded successfully.",
      payment,
    });
  } catch (error) {
    console.error("refundPayment error:", error.message);
    res.status(500).json({
      message: "Server error while refunding payment.",
    });
  }
};

export {
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
};
