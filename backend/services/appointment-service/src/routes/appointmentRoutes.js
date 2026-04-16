import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  modifyAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  getDoctorAvailability,
  getDoctorSchedule,
  searchDoctorsBySpecialty,
  getAllAppointments,
  getInternalAppointmentDetails,
} from '../controllers/appointmentController.js';

const router = express.Router();

// ── Internal (service-to-service only) ───────────────────────
const verifyInternalService = (req, res, next) => {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({ message: 'Unauthorized internal service call.' });
  }
  next();
};

router.put('/internal/payment-status', verifyInternalService, updatePaymentStatus);
router.get('/internal/:id', verifyInternalService, getInternalAppointmentDetails);

// Search doctors by specialty (proxied through appointment-service)
router.get('/search', authenticate, searchDoctorsBySpecialty);

// Admin: get all appointments
router.get('/admin/all', authenticate, authorize('admin'), getAllAppointments);

// Get doctor's booked slots for a date
router.get(
  '/doctor/:doctorId/availability',
  [
    param('doctorId').notEmpty().withMessage('Doctor ID is required'),
    query('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  getDoctorAvailability
);

// Get merged schedule: doctor-service availability + booked appointments
router.get(
  '/doctor/:doctorId/schedule',
  [
    param('doctorId').notEmpty().withMessage('Doctor ID is required'),
    query('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  getDoctorSchedule
);

// Book an appointment (patient only)
// doctorName, doctorEmail, specialty, hospital, fee auto-fetched from doctor-service
router.post(
  '/',
  authenticate,
  authorize('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    body('timeSlot').notEmpty().withMessage('Time slot is required'),
    body('type').optional().isIn(['in-person', 'telemedicine']),
  ],
  validate,
  bookAppointment
);

// Get all appointments for the current user
router.get('/', authenticate, getMyAppointments);

// Get a specific appointment
router.get('/:id', authenticate, getAppointmentById);

// Modify appointment (patient reschedule)
router.put(
  '/:id',
  authenticate,
  authorize('patient', 'admin'),
  [
    body('appointmentDate').optional().isISO8601(),
    body('timeSlot').optional().notEmpty(),
  ],
  validate,
  modifyAppointment
);

// Cancel appointment (patient, doctor, admin)
router.put(
  '/:id/cancel',
  authenticate,
  authorize('patient', 'doctor', 'admin'),
  cancelAppointment
);

// Update status (doctor/admin: confirm, complete, no-show)
router.put(
  '/:id/status',
  authenticate,
  authorize('doctor', 'admin'),
  [
    body('status')
      .isIn(['confirmed', 'completed', 'no-show'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateAppointmentStatus
);

export default router;