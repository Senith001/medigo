const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllNotifications,
  getByAppointment,
  sendPaymentNotification
} = require('../controllers/notificationController');

const verifyInternalService = (req, res, next) => {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({ message: 'Unauthorized internal service call.' });
  }
  next();
};

// ✅ FIXED: Both paths accept — payment-service uses /payment-status
router.post('/internal/payment-status', verifyInternalService, sendPaymentNotification);
router.post('/internal/payment-confirmed', verifyInternalService, sendPaymentNotification);

// Admin logs
router.get('/', authenticate, authorize('admin'), getAllNotifications);

// Appointment notifications
router.get('/appointment/:appointmentId', authenticate, authorize('admin', 'doctor', 'patient'), getByAppointment);

module.exports = router;