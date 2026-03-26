import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getMyAvailability,
  updateMyAvailability,
  getDoctorAvailability,
} from '../controllers/availabilityController.js';

const router = express.Router();

// Doctor manages own availability
router.get('/me', protect, authorize('doctor'), getMyAvailability);
router.put('/me', protect, authorize('doctor'), updateMyAvailability);

// Public — view a doctor's availability
router.get('/:doctorId', getDoctorAvailability);

export default router;
