import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  uploadReport,
  getMyReports,
  getPatientReports,
  getReportsByAppointment,
  getReportById,
  downloadReport,
  shareReport,
  addDoctorNotes,
  deleteReport,
} from '../controllers/reportController.js';

const router = express.Router();

// ── Multer setup ───────────────────────────────────────────────
const uploadDir = 'uploads/reports';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.dcm'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, PNG, and DICOM files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }, // 5MB
});

// ── Routes ─────────────────────────────────────────────────────

// Patient uploads report
router.post('/upload', protect, authorize('patient', 'doctor'), upload.single('report'), uploadReport);

// Patient views own reports
router.get('/my', protect, getMyReports);

// Doctor views patient reports (shared)
router.get('/patient/:patientId', protect, authorize('doctor', 'admin'), getPatientReports);

// Get reports by appointment
router.get('/appointment/:appointmentId', protect, getReportsByAppointment);

// Download report
router.get('/:id/download', protect, downloadReport);

// Share report with doctor
router.put('/:id/share', protect, authorize('patient'), shareReport);

// Doctor adds notes
router.put('/:id/notes', protect, authorize('doctor', 'admin'), addDoctorNotes);

// Get single report
router.get('/:id', protect, getReportById);

// Delete report
router.delete('/:id', protect, deleteReport);

export default router;
