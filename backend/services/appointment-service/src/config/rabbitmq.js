import amqp from 'amqplib';

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();

    // Declare exchange and queues
    await channel.assertExchange('appointment_events', 'topic', { durable: true });
    await channel.assertQueue('appointment.booked',    { durable: true });
    await channel.assertQueue('appointment.cancelled', { durable: true });
    await channel.assertQueue('appointment.updated',   { durable: true });

    // Bind queues to exchange
    await channel.bindQueue('appointment.booked',    'appointment_events', 'appointment.booked');
    await channel.bindQueue('appointment.cancelled', 'appointment_events', 'appointment.cancelled');
    await channel.bindQueue('appointment.updated',   'appointment_events', 'appointment.updated');

    console.log('RabbitMQ connected and queues ready');

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed. Retrying in 5s...');
      setTimeout(connectRabbitMQ, 5000);
    });
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishEvent = async (routingKey, payload) => {
  try {
    if (!channel) throw new Error('RabbitMQ channel not initialized');
    const message = JSON.stringify(payload);
    channel.publish('appointment_events', routingKey, Buffer.from(message), { persistent: true });
    console.log(`Event published: ${routingKey}`);
  } catch (error) {
    console.error('Failed to publish event:', error.message);
  }
};

export { connectRabbitMQ, publishEvent };
