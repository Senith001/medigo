const Notification = require('../models/Notification');
const axios = require('axios');
const { 
  sendEmail, 
  buildPaymentEmail, 
  buildPendingPaymentEmail, 
  buildRejectedPaymentEmail 
} = require('../config/emailService');
const { sendSMS, buildPaymentSMS } = require('../config/smsService');

// POST /api/notifications/internal/payment-confirmed
// Internal — called by payment-service only (x-service-secret)
const sendPaymentNotification = async (req, res) => {
  try {
    const {
      appointmentId, patientName, patientEmail, patientPhone,
      doctorName, amount, currency, invoiceNumber, type,
    } = req.body;

    if (!appointmentId || !patientEmail) {
      return res.status(400).json({ message: 'appointmentId and patientEmail are required.' });
    }

    // ─────────────────────────────────────────────────────────────
    // Fetch full appointment details from appointment-service
    // to enrich the email (fill in Date/Time Slot/Specialty)
    // ─────────────────────────────────────────────────────────────
    let enrichedData;
    try {
      const aptRes = await axios.get(
        `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/internal/${appointmentId}`,
        {
          headers: { 'x-service-secret': process.env.SERVICE_SECRET }
        }
      );
      enrichedData = aptRes.data;
    } catch (err) {
      console.warn(`Could not reach appointment-service to enrich notification: ${err.message}`);
      // Use fallback from body
      enrichedData = { 
        appointmentId, patientName, patientEmail, patientPhone,
        doctorName, amount, currency, invoiceNumber,
        appointmentDate: req.body.appointmentDate || null,
        timeSlot: req.body.timeSlot || null
      };
    }

    const appointmentRef = `#APT-${appointmentId.slice(-4).toUpperCase()}`;

    const data = {
      appointmentId, 
      appointmentRef,
      patientName: patientName || enrichedData.patientName, 
      patientEmail,
      patientPhone: patientPhone || enrichedData.patientPhone || null,
      doctorName: doctorName || enrichedData.doctorName, 
      amount: amount || enrichedData.fee || 0, 
      currency: currency || enrichedData.currency || 'LKR', 
      invoiceNumber: invoiceNumber || enrichedData.invoiceNumber || 'N/A', 
      appointmentDate: enrichedData.appointmentDate, 
      timeSlot: enrichedData.timeSlot,
      rejectionReason: req.body.rejectionReason || null
    };

    // Choose email template based on type
    let emailPayload;
    let notificationType = "payment_notification";

    // Standardize 'approved' to 'paid' for template choice
    const normType = type === 'approved' ? 'paid' : type;

    switch (normType) {
      case "paid":
        emailPayload = buildPaymentEmail(data);
        notificationType = "payment_success";
        break;
      case "verification_pending":
        emailPayload = buildPendingPaymentEmail(data);
        notificationType = "payment_pending";
        break;
      case "rejected":
        emailPayload = buildRejectedPaymentEmail(data);
        notificationType = "payment_rejected";
        break;
      default:
        console.warn(`Unknown payment notification type: ${type}. Defaulting to confirmed.`);
        emailPayload = buildPaymentEmail(data);
        notificationType = "payment_confirmed";
    }

    // Email to patient
    try {
      await sendEmail(patientEmail, emailPayload.subject, emailPayload.html);
      await Notification.create({
        appointmentId, 
        recipientEmail: patientEmail, 
        recipientName: patientName || enrichedData.patientName,
        type: notificationType, 
        channel: 'email', 
        status: 'sent',
      });
    } catch (err) {
      console.error(`${notificationType} email failed:`, err.message);
      await Notification.create({
        appointmentId, 
        recipientEmail: patientEmail, 
        recipientName: patientName || enrichedData.patientName,
        type: notificationType, 
        channel: 'email', 
        status: 'failed', 
        errorMessage: err.message,
      });
    }

    res.status(200).json({ message: 'Payment notification processed.' });
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