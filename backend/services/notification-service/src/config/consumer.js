const amqp = require('amqplib');
const Notification = require('../models/Notification');
const {
  sendEmail,
  buildBookingEmail,
  buildConfirmationEmail,
  buildCancellationEmail,
  buildUpdateEmail,
} = require('./emailService');
const {
  sendSMS,
  buildBookingSMS,
  buildCancellationSMS,
  buildUpdateSMS,
} = require('./smsService');

/**
 * Helper: log a notification result to MongoDB.
 */
const logNotification = async (appointmentId, recipientEmail, recipientName, type, channel, status, errorMessage = null) => {
  try {
    await Notification.create({
      appointmentId,
      recipientEmail,
      recipientName,
      type,
      channel,
      status,
      errorMessage,
    });
  } catch (err) {
    console.error('Failed to log notification:', err.message);
  }
};

/**
 * Handle appointment.booked event.
 * Send email + SMS to both patient and doctor.
 */
const handleAppointmentBooked = async (data) => {
  const recipients = [
    { name: data.patientName, email: data.patientEmail, phone: data.patientPhone || null },
    { name: data.doctorName,  email: data.doctorEmail,  phone: data.doctorPhone  || null },
  ];

  for (const recipient of recipients) {
    const emailPayload = buildBookingEmail({ ...data, recipientName: recipient.name });

    // Email
    try {
      await sendEmail(recipient.email, emailPayload.subject, emailPayload.html);
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_booked', 'email', 'sent');
    } catch (err) {
      console.error(`Email failed for ${recipient.email}:`, err.message);
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_booked', 'email', 'failed', err.message);
    }

    // SMS (if phone number available)
    if (recipient.phone) {
      const smsBody = buildBookingSMS({ ...data, recipientName: recipient.name });
      try {
        await sendSMS(recipient.phone, smsBody);
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_booked', 'sms', 'sent');
      } catch (err) {
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_booked', 'sms', 'failed', err.message);
      }
    }
  }
};

/**
 * Handle appointment.cancelled event.
 */
const handleAppointmentCancelled = async (data) => {
  const recipients = [
    { name: data.patientName, email: data.patientEmail, phone: data.patientPhone || null },
    { name: data.doctorName,  email: data.doctorEmail,  phone: data.doctorPhone  || null },
  ];

  for (const recipient of recipients) {
    const emailPayload = buildCancellationEmail({ ...data, recipientName: recipient.name });

    try {
      await sendEmail(recipient.email, emailPayload.subject, emailPayload.html);
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_cancelled', 'email', 'sent');
    } catch (err) {
      console.error(`Cancellation email failed for ${recipient.email}:`, err.message);
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_cancelled', 'email', 'failed', err.message);
    }

    if (recipient.phone) {
      const smsBody = buildCancellationSMS({ ...data, recipientName: recipient.name });
      try {
        await sendSMS(recipient.phone, smsBody);
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_cancelled', 'sms', 'sent');
      } catch (err) {
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_cancelled', 'sms', 'failed', err.message);
      }
    }
  }
};

/**
 * Handle appointment.updated event.
 */
const handleAppointmentUpdated = async (data) => {
  const recipients = [
    { name: data.patientName, email: data.patientEmail, phone: data.patientPhone || null },
    { name: data.doctorName,  email: data.doctorEmail,  phone: data.doctorPhone  || null },
  ];

  for (const recipient of recipients) {
    const emailPayload = data.confirmed
      ? buildConfirmationEmail({ ...data, recipientName: recipient.name })
      : buildUpdateEmail({ ...data, recipientName: recipient.name });

    try {
      await sendEmail(recipient.email, emailPayload.subject, emailPayload.html);
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_updated', 'email', 'sent');
    } catch (err) {
      await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_updated', 'email', 'failed', err.message);
    }
    
    // SMS Notifications
    if (recipient.phone) {
      const smsBody = buildUpdateSMS({ ...data, recipientName: recipient.name });
      try {
        await sendSMS(recipient.phone, smsBody);
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_updated', 'sms', 'sent');
      } catch (err) {
        await logNotification(data.appointmentId, recipient.email, recipient.name, 'appointment_updated', 'sms', 'failed', err.message);
      }
    }
  }
};

/**
 * Start consuming messages from RabbitMQ queues.
 */
const startConsumer = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertExchange('appointment_events', 'topic', { durable: true });

    const queues = [
      { name: 'appointment.booked', handler: handleAppointmentBooked },
      { name: 'appointment.cancelled', handler: handleAppointmentCancelled },
      { name: 'appointment.updated', handler: handleAppointmentUpdated },
    ];

    for (const q of queues) {
      await channel.assertQueue(q.name, { durable: true });
      await channel.bindQueue(q.name, 'appointment_events', q.name);

      channel.consume(q.name, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          console.log(`Processing event [${q.name}]:`, data.appointmentId);
          await q.handler(data);
          channel.ack(msg);
        } catch (err) {
          console.error(`Error processing [${q.name}]:`, err.message);
          // Nack and don't requeue to avoid infinite loops on bad messages
          channel.nack(msg, false, false);
        }
      });

      console.log(`Listening on queue: ${q.name}`);
    }

    connection.on('error', (err) => {
      console.error('RabbitMQ error:', err.message);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ closed. Reconnecting in 5s...');
      setTimeout(startConsumer, 5000);
    });
  } catch (error) {
    console.error('Consumer failed to start:', error.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(startConsumer, 5000);
  }
};

module.exports = { startConsumer };