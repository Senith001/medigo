const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  modifyAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  getDoctorAvailability,
  searchDoctorsBySpecialty,
  getAllAppointments,
} = require('../controllers/appointmentController');

// ── Internal (service-to-service only) ───────────────────────
const verifyInternalService = (req, res, next) => {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({ message: 'Unauthorized internal service call.' });
  }
  next();
};

router.put('/internal/payment-status', verifyInternalService, updatePaymentStatus);

// Search doctors by specialty
router.get('/search', authenticate, searchDoctorsBySpecialty);

// Get doctor's booked slots for a date
router.get(
  '/doctor/:doctorId/availability',
  authenticate,
  [
    param('doctorId').notEmpty().withMessage('Doctor ID is required'),
    query('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  getDoctorAvailability
);

// Book an appointment (patient only)
// doctorName, doctorEmail, specialty auto-fetched from doctor-service
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

// Admin: get all appointments
router.get('/admin/all', authenticate, authorize('admin'), getAllAppointments);

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

module.exports = router;