const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllNotifications, getByAppointment, sendPaymentNotification } = require('../controllers/notificationController');

// Internal service-to-service middleware
const verifyInternalService = (req, res, next) => {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== process.env.SERVICE_SECRET) {
    return res.status(403).json({ message: 'Unauthorized internal service call.' });
  }
  next();
};

// Internal — payment-service calls this after payment confirmed
router.post('/internal/payment-confirmed', verifyInternalService, sendPaymentNotification);

// Admin: view all notification logs
router.get('/', authenticate, authorize('admin'), getAllNotifications);

// Get notifications for a specific appointment
router.get('/appointment/:appointmentId', authenticate, authorize('admin', 'doctor', 'patient'), getByAppointment);

module.exports = router;