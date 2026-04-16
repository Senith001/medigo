import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { startConsumer } from './config/consumer.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
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
