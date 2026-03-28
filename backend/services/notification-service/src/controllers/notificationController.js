const Notification = require('../models/Notification');
const { sendEmail, buildPaymentEmail } = require('../config/emailService');
const { sendSMS, buildPaymentSMS } = require('../config/smsService');

// POST /api/notifications/internal/payment-confirmed
// Internal — called by payment-service only (x-service-secret)
const sendPaymentNotification = async (req, res) => {
  try {
    const {
      appointmentId, patientName, patientEmail, patientPhone,
      doctorName, amount, currency, invoiceNumber, appointmentDate, timeSlot,
    } = req.body;

    if (!appointmentId || !patientEmail) {
      return res.status(400).json({ message: 'appointmentId and patientEmail are required.' });
    }

    const data = {
      appointmentId, patientName, patientEmail,
      patientPhone: patientPhone || null,
      doctorName, amount, currency, invoiceNumber, appointmentDate, timeSlot,
    };

    // Email to patient
    try {
      const emailPayload = buildPaymentEmail(data);
      await sendEmail(patientEmail, emailPayload.subject, emailPayload.html);
      await Notification.create({
        appointmentId, recipientEmail: patientEmail, recipientName: patientName,
        type: 'appointment_booked', channel: 'email', status: 'sent',
      });
    } catch (err) {
      console.error('Payment email failed:', err.message);
      await Notification.create({
        appointmentId, recipientEmail: patientEmail, recipientName: patientName,
        type: 'appointment_booked', channel: 'email', status: 'failed', errorMessage: err.message,
      });
    }

    // SMS to patient (if phone available)
    if (data.patientPhone) {
      try {
        const smsBody = buildPaymentSMS(data);
        await sendSMS(data.patientPhone, smsBody);
        await Notification.create({
          appointmentId, recipientEmail: patientEmail, recipientName: patientName,
          type: 'appointment_booked', channel: 'sms', status: 'sent',
        });
      } catch (err) {
        await Notification.create({
          appointmentId, recipientEmail: patientEmail, recipientName: patientName,
          type: 'appointment_booked', channel: 'sms', status: 'failed', errorMessage: err.message,
        });
      }
    }

    res.status(200).json({ message: 'Payment notification sent.' });
  } catch (error) {
    console.error('sendPaymentNotification error:', error.message);
    res.status(500).json({ message: 'Server error sending payment notification.' });
  }
};

// GET /api/notifications - Admin: get all notification logs
const getAllNotifications = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ total, page: parseInt(page), notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

// GET /api/notifications/appointment/:appointmentId
const getByAppointment = async (req, res) => {
  try {
    const notifications = await Notification.find({
      appointmentId: req.params.appointmentId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllNotifications, getByAppointment, sendPaymentNotification };