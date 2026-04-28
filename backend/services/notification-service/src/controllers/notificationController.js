const Notification = require('../models/Notification');
const axios = require('axios');
const {
  sendEmail,
  buildPaymentEmail,
  buildPendingPaymentEmail,
  buildRejectedPaymentEmail
} = require('../config/emailService');
const { sendSMS, buildPaymentSMS, buildPendingPaymentSMS, buildRejectedPaymentSMS } = require('../config/smsService');

const sendPaymentNotification = async (req, res) => {
  try {
    const {
      appointmentId, patientName, patientEmail, patientPhone,
      doctorName, amount, currency, invoiceNumber, type,
    } = req.body;

    if (!appointmentId || !patientEmail) {
      return res.status(400).json({ message: 'appointmentId and patientEmail are required.' });
    }

    // ── Fetch appointment details ─────────────────────────────
    let appt = {};
    try {
      const aptRes = await axios.get(
        `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/internal/${appointmentId}`,
        { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
      );
      // ✅ FIXED: unwrap nested appointment object
      appt = aptRes.data.appointment || aptRes.data || {};
    } catch (err) {
      console.warn(`Appointment-service unreachable: ${err.message}`);
    }

    // ── Fetch patient details (if phone missing) ──────────────
    let patientData = {};
    if (!patientPhone && !appt.patientPhone && appt.patientId) {
      try {
        const patRes = await axios.get(
          `${process.env.PATIENT_SERVICE_URL}/api/patients/${appt.patientId}`,
          { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
        );
        patientData = patRes.data.data || patRes.data || {};
      } catch (err) {
        console.warn(`Patient-service unreachable: ${err.message}`);
      }
    }

    const appointmentRef = `#APT-${appointmentId.slice(-4).toUpperCase()}`;

    const data = {
      appointmentId,
      appointmentRef,
      patientName: patientName || appt.patientName || patientData.fullName || 'Patient',
      patientEmail,
      patientPhone: patientPhone || appt.patientPhone || patientData.phone || null,
      doctorName: doctorName || appt.doctorName || 'Doctor',
      amount: amount || appt.fee || 0,
      currency: currency || 'LKR',
      invoiceNumber: invoiceNumber || 'N/A',
      // ✅ FIXED: correctly pulled from appointment object
      appointmentDate: appt.appointmentDate || null,
      timeSlot: appt.timeSlot || null,
      patientNumber: appt.patientNumber || null,
      rejectionReason: req.body.rejectionReason || null,
    };

    // ── Choose email template ─────────────────────────────────
    let emailPayload;
    let notificationType;

    const normType = type === 'approved' ? 'paid' : type;

    switch (normType) {
      case 'paid':
        emailPayload = buildPaymentEmail(data);
        notificationType = 'payment_success';
        break;
      case 'verification_pending':
        emailPayload = buildPendingPaymentEmail(data);
        notificationType = 'payment_pending';
        break;
      case 'rejected':
        emailPayload = buildRejectedPaymentEmail(data);
        notificationType = 'payment_rejected';
        break;
      default:
        console.warn(`Unknown notification type: ${type}`)
        emailPayload = buildPaymentEmail(data);
        notificationType = 'payment_confirmed';
    }

    // ── Send email ────────────────────────────────────────────
    try {
      await sendEmail(patientEmail, emailPayload.subject, emailPayload.html);
      await Notification.create({
        appointmentId,
        recipientEmail: patientEmail,
        recipientName: data.patientName,
        type: notificationType,
        channel: 'email',
        status: 'sent',
      });
    } catch (err) {
      console.error(`${notificationType} email failed:`, err.message);
      await Notification.create({
        appointmentId,
        recipientEmail: patientEmail,
        recipientName: data.patientName,
        type: notificationType,
        channel: 'email',
        status: 'failed',
        errorMessage: err.message,
      });
    }

    // ── Send SMS (if phone exists) ────────────────────────────
    if (data.patientPhone) {
      try {
        // Format phone to E.164 (assume Sri Lanka +94 if no + prefix)
        let formattedPhone = data.patientPhone.trim();
        if (!formattedPhone.startsWith('+')) {
          if (formattedPhone.startsWith('0')) {
            formattedPhone = formattedPhone.substring(1);
          }
          formattedPhone = `+94${formattedPhone}`;
        }

        let smsBody = null;
        let smsType = null;

        if (normType === 'paid') {
          smsBody = buildPaymentSMS(data);
          smsType = 'payment_success_sms';
        } else if (normType === 'verification_pending') {
          smsBody = buildPendingPaymentSMS(data);
          smsType = 'payment_pending_sms';
        } else if (normType === 'rejected') {
          smsBody = buildRejectedPaymentSMS(data);
          smsType = 'payment_rejected_sms';
        }

        if (smsBody) {
          await sendSMS(formattedPhone, smsBody);
          
          await Notification.create({
            appointmentId,
            recipientPhone: formattedPhone,
            recipientName: data.patientName,
            type: smsType,
            channel: 'sms',
            status: 'sent',
          });
        }
      } catch (smsErr) {
        console.error('SMS notification failed:', smsErr.message);
        await Notification.create({
          appointmentId,
          recipientPhone: data.patientPhone,
          recipientName: data.patientName,
          type: 'payment_sms_failed',
          channel: 'sms',
          status: 'failed',
          errorMessage: smsErr.message,
        });
      }
    }

    res.status(200).json({ message: 'Payment notification processed.' });

  } catch (error) {
    console.error('sendPaymentNotification error:', error.message);
    res.status(500).json({ message: 'Server error sending payment notification.' });
  }
};

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