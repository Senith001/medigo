import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

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

const PORT = process.env.PORT || 5003;

const start = async () => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
  });
};

start();
