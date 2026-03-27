const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
    },
    recipientEmail: {
      type: String,
    },
    recipientPhone: {
      type: String,
    },
    recipientName: {
      type: String,
    },
    type: {
      type: String,
      enum: ['appointment_booked', 'appointment_cancelled', 'appointment_updated'],
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
