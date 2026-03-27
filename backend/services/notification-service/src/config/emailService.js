const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email notification.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body content
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Healthcare Platform" <noreply@healthcare.com>',
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

// ── Email Template Builders ────────────────────────────────────

const buildBookingEmail = (data) => ({
  subject: `Appointment Confirmed – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#2563eb;">Appointment Booking Confirmation</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been successfully booked. Here are the details:</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment ID</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.appointmentId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.patientName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Doctor</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.doctorName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(data.appointmentDate).toDateString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.type}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">
        If you need to cancel or reschedule, please log in to your account.
      </p>
      <p>Thank you for using our Healthcare Platform.</p>
    </div>
  `,
});

const buildCancellationEmail = (data) => ({
  subject: `Appointment Cancelled – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#dc2626;">Appointment Cancellation Notice</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been <strong>cancelled</strong>.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment ID</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.appointmentId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(data.appointmentDate).toDateString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Cancelled By</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.cancelledBy}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Reason</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.cancellationReason}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">
        Please book a new appointment at your convenience.
      </p>
    </div>
  `,
});

const buildUpdateEmail = (data) => ({
  subject: `Appointment Rescheduled – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#d97706;">Appointment Updated</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been rescheduled. New details:</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">New Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(data.appointmentDate).toDateString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">New Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot}</td></tr>
      </table>
    </div>
  `,
});

module.exports = { sendEmail, buildBookingEmail, buildCancellationEmail, buildUpdateEmail };
