const twilio = require('twilio');

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
 * @param {string} to - Recipient phone number (e.g. +94771234567)
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

const buildBookingSMS = (data) =>
  `Healthcare Platform: Hi ${data.recipientName}, your appointment with ${data.doctorName} on ${new Date(data.appointmentDate).toDateString()} at ${data.timeSlot} is confirmed. ID: ${data.appointmentId}`;

const buildCancellationSMS = (data) =>
  `Healthcare Platform: Hi ${data.recipientName}, your appointment on ${new Date(data.appointmentDate).toDateString()} at ${data.timeSlot} has been cancelled. Reason: ${data.cancellationReason}`;

const buildUpdateSMS = (data) =>
  `Healthcare Platform: Hi ${data.recipientName}, your appointment has been rescheduled to ${new Date(data.appointmentDate).toDateString()} at ${data.timeSlot}.`;

const buildPaymentSMS = (data) =>
  `MEDIGO: Hi ${data.patientName}, your payment of ${data.currency || 'LKR'} ${data.amount} is confirmed. Appointment with ${data.doctorName} on ${data.appointmentDate ? new Date(data.appointmentDate).toDateString() : 'N/A'} at ${data.timeSlot || 'N/A'}. Invoice: ${data.invoiceNumber || 'N/A'}`;

module.exports = { sendSMS, buildBookingSMS, buildCancellationSMS, buildUpdateSMS, buildPaymentSMS };