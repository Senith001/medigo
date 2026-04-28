require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const appointmentRoutes = require('./routes/appointmentRoutes');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Appointment Service is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3003;

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
  });
};

start();

module.exports = app;
