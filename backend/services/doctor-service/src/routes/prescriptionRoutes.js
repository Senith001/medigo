import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionsByPatient,
  getPrescriptionByAppointment,
  getPrescriptionById,
  updatePrescription,
} from '../controllers/prescriptionController.js';

const router = express.Router();

// Doctor issues prescription
router.post('/', protect, authorize('doctor'), createPrescription);

// Doctor views own prescriptions
router.get('/my', protect, authorize('doctor'), getMyPrescriptions);

// Get by patient ID (doctor or patient)
router.get('/patient/:patientId', protect, authorize('doctor', 'patient', 'admin'), getPrescriptionsByPatient);

// Get by appointment ID
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);

// Get by prescription ID
router.get('/:id', protect, getPrescriptionById);

// Update prescription
router.put('/:id', protect, authorize('doctor', 'admin'), updatePrescription);

export default router;
