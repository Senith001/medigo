import twilio from 'twilio';

let twilioClient = null;

// Lazily initialize Twilio client (won't crash if creds are missing in dev)
const getClient = () => {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio credentials not set. SMS will be skipped.');
      return null;
    }
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

/**
 * Send an SMS notification.
 * @param {string} to   - Recipient phone number (e.g. +94771234567)
 * @param {string} body - SMS message body
 */
const sendSMS = async (to, body) => {
  const client = getClient();
  if (!client) {
    console.log(`[SMS SKIPPED] To: ${to} | Message: ${body}`);
    return null;
  }

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}: SID ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`SMS send failed to ${to}: ${error.message}`);
    return null;
  }
};

// ── SMS Message Builders ───────────────────────────────────────

const safeDate = (d) => (d ? new Date(d).toDateString() : 'N/A');

const buildBookingSMS = (data) =>
  `MEDIGO: Hi ${data.recipientName}, your appointment with ${data.doctorName || 'your doctor'} on ${safeDate(data.appointmentDate)} at ${data.timeSlot || 'N/A'} is received. ID: ${data.appointmentId || 'N/A'}`;

const buildCancellationSMS = (data) =>
  `MEDIGO: Hi ${data.recipientName}, your appointment on ${safeDate(data.appointmentDate)} at ${data.timeSlot || 'N/A'} has been cancelled. Reason: ${data.cancellationReason || 'N/A'}`;

const buildUpdateSMS = (data) =>
  `MEDIGO: Hi ${data.recipientName}, your appointment has been rescheduled to ${safeDate(data.appointmentDate)} at ${data.timeSlot || 'N/A'}.`;

const buildPaymentSMS = (data) =>
  `MEDIGO: Hi ${data.patientName || 'Patient'}, your payment of ${data.currency || 'LKR'} ${data.amount || 0} is confirmed. Appointment with ${data.doctorName || 'your doctor'} on ${safeDate(data.appointmentDate)} at ${data.timeSlot || 'N/A'}. Invoice: ${data.invoiceNumber || 'N/A'}`;

export { sendSMS, buildBookingSMS, buildCancellationSMS, buildUpdateSMS, buildPaymentSMS };