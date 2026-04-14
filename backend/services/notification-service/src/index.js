require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { startConsumer } = require('./config/consumer');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes (for admin to query notification logs)
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running', timestamp: new Date() });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3005;

const start = async () => {
  await connectDB();
  await startConsumer(); // Start listening to RabbitMQ queues
  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });
};

start();

module.exports = app;
