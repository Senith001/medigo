import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT) || 587,
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

// Safe helper so .slice() never crashes on a missing id
const safeRef = (id) => (id ? String(id).slice(-4).toUpperCase() : 'XXXX');
const safeDate = (d) => (d ? new Date(d).toDateString() : 'N/A');

// ── Appointment Received (after booking — pending status) ──────
const buildBookingEmail = (data) => ({
  subject: `Appointment Request Received – ${safeDate(data.appointmentDate)}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#d97706;">Appointment Request Received</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment request has been received and is <strong>pending doctor confirmation</strong>. You will receive another email once the doctor confirms your appointment.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment Ref</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;color:#3b82f6;">#APT-${safeRef(data.appointmentId)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Patient</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.patientName || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Doctor</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.doctorName || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${safeDate(data.appointmentDate)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Type</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.type || 'N/A'}</td></tr>
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
  subject: `Appointment Confirmed – ${safeDate(data.appointmentDate)}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#16a34a;">Appointment Confirmed!</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been <strong>confirmed</strong> by the doctor. Please complete your payment to secure your slot.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment Ref</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;color:#3b82f6;">#APT-${safeRef(data.appointmentId)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Doctor</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.doctorName || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${safeDate(data.appointmentDate)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot || 'N/A'}</td></tr>
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
  subject: `Appointment Cancelled – ${safeDate(data.appointmentDate)}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#dc2626;">Appointment Cancellation Notice</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been <strong>cancelled</strong>.</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Appointment Ref</td>
            <td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;color:#ef4444;">#APT-${safeRef(data.appointmentId)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${safeDate(data.appointmentDate)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Time</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Cancelled By</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.cancelledBy || 'N/A'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Reason</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.cancellationReason || 'N/A'}</td></tr>
      </table>
      <p style="color:#6b7280;font-size:14px;margin-top:20px;">
        Please book a new appointment at your convenience.
      </p>
    </div>
  `,
});

// ── Appointment Rescheduled ────────────────────────────────────
const buildUpdateEmail = (data) => ({
  subject: `Appointment Rescheduled – ${safeDate(data.appointmentDate)}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#d97706;">Appointment Rescheduled</h2>
      <p>Dear <strong>${data.recipientName}</strong>,</p>
      <p>Your appointment has been rescheduled. New details:</p>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">New Date</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${safeDate(data.appointmentDate)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">New Time Slot</td>
            <td style="padding:8px;border:1px solid #e5e7eb;">${data.timeSlot || 'N/A'}</td></tr>
      </table>
    </div>
  `,
});

// ── Payment Confirmed (Status: paid) ──────────────────────────
const buildPaymentEmail = (data) => ({
  subject: `Payment Confirmed – Invoice ${data.invoiceNumber || ''}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;padding:30px;border-radius:20px;background:#fcfdfd;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="background:#ecfdf5;width:60px;height:60px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:15px;">
           <span style="font-size:30px;line-height:60px;">✅</span>
        </div>
        <h2 style="color:#065f46;margin:0;">Payment Confirmed!</h2>
        <p style="color:#6b7280;margin:5px 0 0;">Your appointment is now fully secured.</p>
      </div>

      <p>Dear <strong>${data.patientName || 'Patient'}</strong>,</p>
      <p>Thank you for your payment. We have successfully processed your transaction and your appointment details are listed below.</p>
      
      <div style="background:#f8fafc;padding:20px;border-radius:15px;margin:25px 0;">
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Appointment Ref</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#0d9488;">#APT-${safeRef(data.appointmentId)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Invoice No.</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#1e293b;">${data.invoiceNumber || 'N/A'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Doctor</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#1e293b;">${data.doctorName || 'N/A'}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Date</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#1e293b;">${safeDate(data.appointmentDate)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">Time Slot</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:#1e293b;">${data.timeSlot || 'N/A'}</td></tr>
          <tr><td style="padding:20px 0 0;font-size:18px;font-weight:bold;color:#0f172a;">Total Paid</td>
              <td style="padding:20px 0 0;text-align:right;font-size:24px;font-weight:black;color:#0d9488;">${data.currency || 'LKR'} ${data.amount || 0}</td></tr>
        </table>
      </div>

      <p style="color:#64748b;font-size:13px;line-height:1.6;margin-top:30px;text-align:center;">
        You can view your appointment details and medical reports anytime by logging into your dashboard.<br/>
        <strong>Thank you for choosing MEDIGO.</strong>
      </p>
    </div>
  `,
});

// ── Payment Verification Pending (Status: verification_pending) ────
const buildPendingPaymentEmail = (data) => ({
  subject: `Payment Verification Pending – ${data.invoiceNumber || ''}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;padding:30px;border-radius:20px;background:#fcfdfd;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="background:#fff7ed;width:60px;height:60px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:15px;">
           <span style="font-size:30px;line-height:60px;">⏳</span>
        </div>
        <h2 style="color:#9a3412;margin:0;">Payment Under Verification</h2>
        <p style="color:#6b7280;margin:5px 0 0;">We are reviewing your bank transfer.</p>
      </div>

      <p>Dear <strong>${data.patientName || 'Customer'}</strong>,</p>
      <p>We have received your bank transfer slip. Our team is currently verifying the payment. This usually takes <strong>1-2 business hours</strong>.</p>
      
      <div style="border:1px dashed #cbd5e1;padding:20px;border-radius:15px;margin:25px 0;">
        <p style="margin:0 0 5px;font-weight:bold;color:#334155;">Appointment Ref: #APT-${safeRef(data.appointmentId)}</p>
        <p style="margin:0 0 10px;font-weight:bold;color:#334155;">Booking Reference: ${data.invoiceNumber || 'N/A'}</p>
        <p style="margin:0;color:#64748b;font-size:14px;">Once verified, you will receive a confirmation email and your appointment status will update to "Confirmed".</p>
      </div>

      <p style="color:#64748b;font-size:13px;line-height:1.6;margin-top:30px;">
        Thank you for your patience.<br/>
        <strong>Team MEDIGO</strong>
      </p>
    </div>
  `,
});

// ── Payment Rejected (Status: rejected) ─────────────────────────
const buildRejectedPaymentEmail = (data) => ({
  subject: `Action Required: Payment Verification Failed`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #fee2e2;padding:30px;border-radius:20px;background:#fffafb;">
      <div style="text-align:center;margin-bottom:30px;">
        <div style="background:#fef2f2;width:60px;height:60px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:15px;">
           <span style="font-size:30px;line-height:60px;">❌</span>
        </div>
        <h2 style="color:#991b1b;margin:0;">Payment Verification Failed</h2>
        <p style="color:#6b7280;margin:5px 0 0;">Action required for your appointment.</p>
      </div>

      <p>Dear <strong>${data.patientName || 'Patient'}</strong>,</p>
      <p>We are sorry to inform you that the payment verification for your appointment <strong>#APT-${safeRef(data.appointmentId)}</strong> was <strong>rejected</strong> by our team for the following reason:</p>
      
      <div style="background:#fee2e2;padding:15px;border-radius:10px;color:#991b1b;font-weight:bold;margin:20px 0;">
        ${data.rejectionReason || 'Identity or reference mismatch.'}
      </div>

      <p>Please log in to your dashboard to re-upload a valid payment slip or use an alternative payment method to keep your appointment slot.</p>

      <p style="color:#64748b;font-size:13px;line-height:1.6;margin-top:30px;">
        Regards,<br/>
        <strong>Admin Team, MEDIGO</strong>
      </p>
    </div>
  `,
});

export {
  sendEmail,
  buildBookingEmail,
  buildConfirmationEmail,
  buildCancellationEmail,
  buildUpdateEmail,
  buildPaymentEmail,
  buildPendingPaymentEmail,
  buildRejectedPaymentEmail,
};