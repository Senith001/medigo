import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../backend/services/payment-service/.env') });

const appointmentId = '69e1fa3c2542a57fe4e8cd55';

async function check() {
  try {
    const url = `http://localhost:5005/api/appointments/internal/${appointmentId}`;
    console.log(`Fetching from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'x-service-secret': process.env.SERVICE_SECRET
      }
    });

    console.log('Internal Response:', JSON.stringify(response.data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Fetch failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

check();
