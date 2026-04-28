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

// ── Appointment Received (after booking — awaiting payment) ──────
const buildBookingEmail = (data) => ({
  subject: `Reservation Received – Ref: #APT-${data.appointmentId.slice(-4).toUpperCase()}`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Reservation Received</h1>
        <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">Please complete your payment to secure this slot.</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin: 0 0 30px; line-height: 1.6; color: #64748b; font-size: 15px;">
          Your appointment request has been received. To <strong>fully secure your position</strong> and confirm the session, please complete the payment process.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #f1f5f9; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Appointment Ref</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 800; text-align: right;">#APT-${data.appointmentId.slice(-4).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Appointment No.</td>
              <td style="padding: 8px 0; color: #2563eb; font-size: 18px; font-weight: 900; text-align: right;">#${data.patientNumber || 'Pending'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Specialist</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Hospital</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.hospital || 'MediGo Medical Center'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${new Date(data.appointmentDate).toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Time Slot</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.timeSlot}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">Proceed to Payment</a>
        </div>
      </div>
      
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">© 2026 MEDIGO Healthcare Systems</p>
      </div>
    </div>
  `,
});

// ── Appointment Confirmed (Professional E-Ticket) ──────────────
const buildConfirmationEmail = (data) => ({
  subject: `Appointment Confirmed – Ticket #${data.patientNumber || '00'}`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; background-color: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 45px 30px; text-align: center; color: white;">
        <div style="background-color: rgba(255,255,255,0.2); width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <span style="font-size: 32px;">✅</span>
        </div>
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Confirmed Appointment</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 15px; font-weight: 500;">Please present this ticket at the reception.</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="margin: 0 0 25px; font-size: 16px; color: #1e293b;">Dear <strong>${data.recipientName}</strong>, your session is now officially confirmed.</p>
        
        <div style="border: 2px solid #0d9488; border-radius: 24px; overflow: hidden; background-color: #f0fdfa;">
          <div style="padding: 25px; text-align: center; border-bottom: 2px dashed #0d9488;">
             <div style="font-size: 12px; color: #0d9488; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Appointment No.</div>
             <div style="font-size: 48px; font-weight: 900; color: #0f172a; line-height: 1;">#${data.patientNumber || '01'}</div>
             <div style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 10px;">Ref: #APT-${data.appointmentId.slice(-4).toUpperCase()}</div>
          </div>

          <div style="padding: 30px; background-color: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0;">
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Doctor</div>
                  <div style="font-size: 16px; font-weight: 700; color: #1e293b;">Dr. ${data.doctorName}</div>
                </td>
                <td style="padding: 12px 0; text-align: right;">
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Date</div>
                  <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${new Date(data.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-top: 1px solid #f1f5f9;">
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Time Slot</div>
                  <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${data.timeSlot}</div>
                </td>
                <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; text-align: right;">
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Type</div>
                  <div style="font-size: 16px; font-weight: 700; color: #1e293b;">${data.type === 'telemedicine' ? 'Video Consult' : 'Hospital Visit'}</div>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 15px 0; border-top: 1px solid #f1f5f9;">
                  <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Hospital / Location</div>
                  <div style="font-size: 15px; font-weight: 700; color: #1e293b;">${data.hospital || 'MediGo Medical Center'}</div>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background-color: #fffbeb; border-radius: 16px; border: 1px solid #fef3c7;">
          <h4 style="margin: 0 0 10px; font-size: 13px; color: #92400e; font-weight: 800; text-transform: uppercase;">Patient Instructions</h4>
          <ul style="margin: 0; padding: 0 0 0 18px; font-size: 13px; color: #b45309; line-height: 1.6;">
            <li>Please arrive 15 minutes early for document verification.</li>
            <li>Bring your NIC and this e-Ticket (Phone or Print).</li>
            <li>Masks are mandatory within hospital premises.</li>
          </ul>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600;">Generated by MEDIGO Healthcare Cloud • No signature required</p>
      </div>
    </div>
  `,
});

// ── Appointment Cancelled ──────────────────────────────────────
const buildCancellationEmail = (data) => ({
  subject: `Cancellation Notice – Ref: #APT-${data.appointmentId.slice(-4).toUpperCase()}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #ef4444; padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Appointment Cancelled</h1>
      </div>
      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin: 0 0 30px; line-height: 1.6; color: #475569; font-size: 15px;">Your appointment with <strong>${data.doctorName}</strong> has been cancelled.</p>
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 20px; padding: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Cancelled By</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 700; text-align: right;">${data.cancelledBy === 'doctor' ? 'Specialist' : 'Patient'}</td></tr>
            <tr><td style="padding: 8px 0; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Reason</td>
                <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 500; text-align: right; font-style: italic;">"${data.cancellationReason}"</td></tr>
          </table>
        </div>
      </div>
    </div>
  `,
});

// ── Appointment Rescheduled ────────────────────────────────────
const buildUpdateEmail = (data) => ({
  subject: `Schedule Update – Ref: #APT-${data.appointmentId.slice(-4).toUpperCase()}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
      <div style="background-color: #3b82f6; padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Schedule Updated</h1>
      </div>
      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Dear <strong>${data.recipientName}</strong>,</p>
        <p style="margin: 0 0 30px; line-height: 1.6; color: #475569; font-size: 15px;">Your appointment schedule has been adjusted. Please note the new session details.</p>
        <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px; border-left: 5px solid #3b82f6;">
           <div style="margin-bottom: 15px;">
             <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">New Date</div>
             <div style="font-size: 18px; font-weight: 800; color: #1e293b;">${new Date(data.appointmentDate).toDateString()}</div>
           </div>
           <div>
             <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">New Time Slot</div>
             <div style="font-size: 18px; font-weight: 800; color: #1e293b;">${data.timeSlot}</div>
           </div>
        </div>
      </div>
    </div>
  `,
});

// ── Payment Confirmed (Professional Receipt) ───────────────────
const buildPaymentEmail = (data) => ({
  subject: `Official Receipt – INV: ${data.invoiceNumber || "0000"}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; background-color: #ffffff;">
      <div style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9; background-color: #fcfdfd;">
        <div style="background-color: #ecfdf5; width: 72px; height: 72px; border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <span style="font-size: 36px;">💳</span>
        </div>
        <h2 style="margin: 0; color: #059669; font-size: 24px; font-weight: 800;">Payment Successful</h2>
        <p style="margin: 8px 0 0; color: #64748b; font-size: 14px; font-weight: 500;">Invoice: <strong>${data.invoiceNumber || "N/A"}</strong></p>
      </div>

      <div style="padding: 35px 30px;">
        <p style="margin: 0 0 25px; font-size: 15px; color: #475569;">Hello <strong>${data.patientName}</strong>, thank you for your payment. Your transaction has been processed.</p>
        
        <div style="background-color: #f8fafc; border-radius: 24px; padding: 30px; border: 1px solid #f1f5f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Appointment Ref</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">#APT-${data.appointmentId.slice(-4).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Appointment No.</td>
              <td style="padding: 10px 0; color: #2563eb; font-size: 16px; font-weight: 800; text-align: right;">#${data.patientNumber || '01'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Specialist</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 600;">Hospital</td>
              <td style="padding: 10px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.hospital || 'MediGo Medical Center'}</td>
            </tr>
            <tr style="border-top: 2px dashed #e2e8f0;">
              <td style="padding: 20px 0 0; color: #0f172a; font-size: 16px; font-weight: 800;">Total Amount</td>
              <td style="padding: 20px 0 0; color: #059669; font-size: 24px; font-weight: 900; text-align: right;">${data.currency || "LKR"} ${data.amount}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-top: 30px; text-align: center; background-color: #eff6ff; padding: 15px; border-radius: 12px;">
          <p style="margin: 0; color: #2563eb; font-size: 13px; font-weight: 600;">
            A separate digital e-Ticket has been sent to your email.
          </p>
        </div>
      </div>
    </div>
  `,
});

// ── Payment Verification Pending ──────────────────────────────
const buildPendingPaymentEmail = (data) => ({
  subject: `Verification Pending – Ref: #APT-${data.appointmentId.slice(-4).toUpperCase()}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #f59e0b; padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Verification Pending</h1>
      </div>
      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Dear <strong>${data.patientName || "Patient"}</strong>,</p>
        <p style="margin: 0 0 30px; line-height: 1.6; color: #475569; font-size: 15px;">
          We have received your payment slip for appointment <strong>#APT-${data.appointmentId.slice(-4).toUpperCase()}</strong>. Our team is verifying the transaction.
        </p>
        <div style="background-color: #fffbeb; border-radius: 16px; padding: 20px;">
          <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600; text-align: center;">
            You will receive your e-Ticket once the verification is complete.
          </p>
        </div>
      </div>
    </div>
  `,
});

// ── Payment Rejected ─────────────────────────────────────────
const buildRejectedPaymentEmail = (data) => ({
  subject: `Action Required: Payment Rejected`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 24px; overflow: hidden;">
      <div style="background-color: #dc2626; padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Payment Verification Failed</h1>
      </div>
      <div style="padding: 40px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Dear <strong>${data.patientName}</strong>,</p>
        <p style="margin: 0 0 30px; line-height: 1.6; color: #475569; font-size: 15px;">The payment slip for appointment <strong>#APT-${data.appointmentId.slice(-4).toUpperCase()}</strong> could not be verified.</p>
        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 16px; padding: 20px;">
          <div style="font-size: 11px; color: #991b1b; font-weight: 700; text-transform: uppercase;">Reason</div>
          <div style="font-size: 14px; font-weight: 700; color: #b91c1c;">${data.rejectionReason || "Details provided were incorrect."}</div>
        </div>
      </div>
    </div>
  `,
});

// ── Doctor Notification (New Reservation) ─────────────────────
const buildDoctorBookingEmail = (data) => ({
  subject: `New Reservation Request – #${data.patientNumber || '00'}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">New Appointment Reservation</h1>
        <p style="margin: 10px 0 0; opacity: 0.8; font-size: 14px;">A patient has reserved a slot in your session.</p>
      </div>
      
      <div style="padding: 35px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Hello <strong>Dr. ${data.doctorName}</strong>,</p>
        <p style="margin: 0 0 25px; line-height: 1.6; color: #64748b; font-size: 15px;">
          You have a new appointment reservation. This will be officially confirmed once the payment is verified.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px; border: 1px solid #f1f5f9;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Patient Name</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.patientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Patient No.</td>
              <td style="padding: 8px 0; color: #2563eb; font-size: 18px; font-weight: 900; text-align: right;">#${data.patientNumber || 'Pending'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${new Date(data.appointmentDate).toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Time Slot</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.timeSlot}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `,
});

// ── Doctor Notification (Confirmed Appointment) ──────────────
const buildDoctorConfirmationEmail = (data) => ({
  subject: `Confirmed Patient: #${data.patientNumber || '00'} - ${data.patientName}`,
  html: `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 28px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 45px 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Appointment Confirmed</h1>
        <p style="margin: 10px 0 0; opacity: 0.9; font-size: 15px;">Payment verified. This patient is added to your queue.</p>
      </div>
      
      <div style="padding: 35px 30px;">
        <p style="margin: 0 0 20px; font-size: 16px; color: #1e293b;">Hello <strong>Dr. ${data.doctorName}</strong>,</p>
        
        <div style="border: 2px solid #0d9488; border-radius: 20px; padding: 25px; background-color: #f0fdfa;">
           <div style="text-align: center; margin-bottom: 20px;">
             <div style="font-size: 11px; color: #0d9488; font-weight: 800; text-transform: uppercase;">Queue Number</div>
             <div style="font-size: 40px; font-weight: 900; color: #0f172a;">#${data.patientNumber || '01'}</div>
           </div>
           
           <table style="width: 100%; border-collapse: collapse;">
             <tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Patient</td>
                 <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${data.patientName}</td></tr>
             <tr><td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date/Time</td>
                 <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${new Date(data.appointmentDate).toDateString()} | ${data.timeSlot}</td></tr>
           </table>
        </div>
        
        <div style="margin-top: 25px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor-dashboard" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700;">View Session Queue</a>
        </div>
      </div>
    </div>
  `,
});

module.exports = {
  sendEmail,
  buildBookingEmail,
  buildConfirmationEmail,
  buildCancellationEmail,
  buildUpdateEmail,
  buildPaymentEmail,
  buildPendingPaymentEmail,
  buildRejectedPaymentEmail,
  buildDoctorBookingEmail,
  buildDoctorConfirmationEmail,
};