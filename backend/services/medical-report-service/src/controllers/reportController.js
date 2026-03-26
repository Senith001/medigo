import MedicalReport from '../models/MedicalReport.js';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────────────────
// POST /api/reports/upload
// Patient uploads a medical report
// ─────────────────────────────────────────────────────────────
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { title, description, reportType, appointmentId } = req.body;

    const report = await MedicalReport.create({
      patientId:     req.user.id,
      patientName:   req.user.name,
      patientEmail:  req.user.email,
      title:         title || req.file.originalname,
      description,
      reportType:    reportType || 'other',
      fileName:      req.file.originalname,
      fileUrl:       `/uploads/reports/${req.file.filename}`,
      fileSize:      req.file.size,
      mimeType:      req.file.mimetype,
      appointmentId: appointmentId || null,
      uploadedBy:    req.user.role,
    });

    res.status(201).json({ success: true, message: 'Report uploaded successfully.', report });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports/my
// Patient views their own reports
// ─────────────────────────────────────────────────────────────
export const getMyReports = async (req, res) => {
  try {
    const { reportType, page = 1, limit = 10 } = req.query;
    const filter = { patientId: req.user.id };
    if (reportType) filter.reportType = reportType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await MedicalReport.countDocuments(filter);
    const reports = await MedicalReport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, page: parseInt(page), reports });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports/patient/:patientId
// Doctor views a patient's reports (must be shared)
// ─────────────────────────────────────────────────────────────
export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Doctor can only view reports shared with them OR linked to their appointments
    const filter = {
      patientId,
      $or: [
        { sharedWith: doctorId },
        { reviewedBy: doctorId },
      ],
    };

    // Admin sees all
    if (req.user.role === 'admin') delete filter.$or;

    const reports = await MedicalReport.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: reports.length, reports });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports/appointment/:appointmentId
// Get reports linked to an appointment
// ─────────────────────────────────────────────────────────────
export const getReportsByAppointment = async (req, res) => {
  try {
    const reports = await MedicalReport.find({ appointmentId: req.params.appointmentId })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: reports.length, reports });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports/:id
// Get single report
// ─────────────────────────────────────────────────────────────
export const getReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    const { role, id } = req.user;
    // Access: own patient, shared doctor, or admin
    if (role !== 'admin' && report.patientId !== id && !report.sharedWith.includes(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/reports/:id/download
// Download a report file
// ─────────────────────────────────────────────────────────────
export const downloadReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    const { role, id } = req.user;
    if (role !== 'admin' && report.patientId !== id && !report.sharedWith.includes(id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const filePath = path.join(process.cwd(), report.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.download(filePath, report.fileName);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/reports/:id/share
// Patient shares a report with a doctor
// ─────────────────────────────────────────────────────────────
export const shareReport = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    if (report.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!report.sharedWith.includes(doctorId)) {
      report.sharedWith.push(doctorId);
      await report.save();
    }

    res.status(200).json({ success: true, message: 'Report shared with doctor.', report });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/reports/:id/notes
// Doctor adds notes to a report
// ─────────────────────────────────────────────────────────────
export const addDoctorNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    if (!report.sharedWith.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    report.doctorNotes = notes;
    report.reviewedBy  = req.user.id;
    report.reviewedAt  = new Date();
    await report.save();

    res.status(200).json({ success: true, message: 'Notes added.', report });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/reports/:id
// Patient deletes their own report
// ─────────────────────────────────────────────────────────────
export const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    if (report.patientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), report.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await report.deleteOne();
    res.status(200).json({ success: true, message: 'Report deleted.' });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};
