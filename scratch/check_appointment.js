import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../backend/services/appointment-service/.env') });

const appointmentId = '69e1fa3c2542a57fe4e8cd55';

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const appointment = await mongoose.connection.db.collection('appointments').findOne({ _id: new mongoose.Types.ObjectId(appointmentId) });

    if (!appointment) {
      console.log('Appointment not found');
    } else {
      console.log('Appointment Details:');
      console.log(JSON.stringify(appointment, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
