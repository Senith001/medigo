import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  registerDoctor,
  getMyProfile,
  updateMyProfile,
  getAllDoctors,
  searchDoctors,
  getDoctorById,
  getMyAppointments,
  updateAppointmentStatus,
  getAllDoctorsAdmin,
  verifyDoctor,
  toggleDoctorStatus,
} from '../controllers/doctorController.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────
router.post('/register', registerDoctor);
router.get('/', getAllDoctors);
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);

// ── Doctor (authenticated) ────────────────────────────────────
router.get('/me/profile', protect, authorize('doctor'), getMyProfile);
router.put('/me/profile', protect, authorize('doctor'), updateMyProfile);
router.get('/me/appointments', protect, authorize('doctor'), getMyAppointments);
router.put('/appointments/:appointmentId/status', protect, authorize('doctor'), updateAppointmentStatus);

// ── Admin ─────────────────────────────────────────────────────
router.get('/admin/all', protect, authorize('admin'), getAllDoctorsAdmin);
router.put('/admin/:id/verify', protect, authorize('admin'), verifyDoctor);
router.put('/admin/:id/toggle', protect, authorize('admin'), toggleDoctorStatus);

export default router;
