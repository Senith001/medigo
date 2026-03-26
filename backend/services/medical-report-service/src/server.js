import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import reportRoutes from './routes/reportRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

connectDB();

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'MEDIGO Medical Report Service is running' });
});

app.use('/api/reports', reportRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Medical Report Service running on port ${PORT}`));
