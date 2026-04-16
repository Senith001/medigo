import mongoose from 'mongoose';

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
      // Extended to cover payment notification types too
      enum: [
        'appointment_booked',
        'appointment_cancelled',
        'appointment_updated',
        'payment_success',
        'payment_pending',
        'payment_rejected',
        'payment_confirmed',
        'payment_notification',
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

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
