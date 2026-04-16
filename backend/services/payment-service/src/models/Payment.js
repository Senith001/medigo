import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Main appointment and user details for the payment.
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      index: true,
    },

    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
    },

    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },

    patientEmail: {
      type: String,
      required: [true, "Patient email is required"],
      trim: true,
      lowercase: true,
    },

    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      index: true,
    },

    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    currency: {
      type: String,
      default: "LKR",
      uppercase: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["stripe", "bank_transfer"],
      default: "stripe",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "verification_pending",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Stripe fields
    stripeSessionId: {
      type: String,
      default: null,
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
    },

    // Bank transfer details
    paymentSlipUrl: {
      type: String,
      default: null,
      trim: true,
    },

    transferReference: {
      type: String,
      default: null,
      trim: true,
    },

    // Admin verification details
    verifiedBy: {
      type: String,
      default: null,
      trim: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    failureReason: {
      type: String,
      default: null,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ appointmentId: 1, patientId: 1 });
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
