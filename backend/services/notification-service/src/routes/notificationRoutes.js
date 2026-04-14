const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAllNotifications, getByAppointment } = require('../controllers/notificationController');

// Admin: view all notification logs
router.get('/', authenticate, authorize('admin'), getAllNotifications);

// Get notifications for a specific appointment (admin or involved user)
router.get('/appointment/:appointmentId', authenticate, authorize('admin', 'doctor', 'patient'), getByAppointment);

module.exports = router;
