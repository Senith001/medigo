const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
    },
    recipientEmail: { type: String },
    recipientPhone: { type: String },
    recipientName: { type: String },
    type: {
      type: String,
      enum: [
        // Appointment notifications
        'appointment_booked',
        'appointment_cancelled',
        'appointment_updated',
        // ✅ FIXED: Payment notifications add
        'payment_success',
        'payment_confirmed',
        'payment_pending',
        'payment_rejected',
        'payment_notification',
        'payment_success_sms',
        'payment_pending_sms',
        'payment_rejected_sms',
        'payment_sms_failed',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      default: 'sent',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ appointmentId: 1 });
notificationSchema.index({ recipientEmail: 1 });

module.exports = mongoose.model('Notification', notificationSchema);