const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MEDIGO" <noreply@medigo.com>',
    to,
    subject,
    html,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

// ── Appointment Received (after booking — pending status) ──────
const buildBookingEmail = (data) => ({
  subject: `Appointment Request Received – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#d97706;">Appointment Request Received</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment request has been received and is <strong>pending doctor confirmation</strong>. You will receive another email once the doctor confirms your appointment.</p>
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
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Status</td>
            <td style="padding:8px;border:1px solid #e5e7eb;color:#d97706;font-weight:bold;">Pending Confirmation</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">
        If you need to cancel or reschedule, please log in to your account.
      </p>
      <p>Thank you for using MEDIGO.</p>
    </div>
  `,
});

// ── Appointment Confirmed (after doctor confirms) ──────────────
const buildConfirmationEmail = (data) => ({
  subject: `Appointment Confirmed – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#16a34a;">Appointment Confirmed!</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been <strong>confirmed</strong> by the doctor. Please complete your payment to secure your slot.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment ID</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.appointmentId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Doctor</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.doctorName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${new Date(data.appointmentDate).toDateString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot}</td></tr>
        ${data.meetingLink ? `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Meeting Link</td>
            <td style="padding:8px;border:1px solid #e5e7eb;"><a href="${data.meetingLink}">${data.meetingLink}</a></td></tr>` : ''}
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Status</td>
            <td style="padding:8px;border:1px solid #e5e7eb;color:#16a34a;font-weight:bold;">Confirmed</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">
        Please log in to complete your payment.
      </p>
      <p>Thank you for using MEDIGO.</p>
    </div>
  `,
});

// ── Appointment Cancelled ──────────────────────────────────────
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

// ── Appointment Rescheduled ────────────────────────────────────
const buildUpdateEmail = (data) => ({
  subject: `Appointment Rescheduled – ${new Date(data.appointmentDate).toDateString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#d97706;">Appointment Rescheduled</h2>
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

// ── Payment Confirmed ──────────────────────────────────────────
const buildPaymentEmail = (data) => ({
  subject: `Payment Confirmed – Invoice ${data.invoiceNumber || ''}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#16a34a;">Payment Confirmed</h2>
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>Your payment has been received and your appointment is fully confirmed.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Invoice No.</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.invoiceNumber || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Doctor</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.doctorName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.appointmentDate ? new Date(data.appointmentDate).toDateString() : 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Amount Paid</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;color:#16a34a;">${data.currency || 'LKR'} ${data.amount}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">Thank you for using MEDIGO.</p>
    </div>
  `,
});

module.exports = { sendEmail, buildBookingEmail, buildConfirmationEmail, buildCancellationEmail, buildUpdateEmail, buildPaymentEmail };