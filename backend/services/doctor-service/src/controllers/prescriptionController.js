import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';

// ─────────────────────────────────────────────────────────────
// POST /api/prescriptions
// Doctor issues a prescription
// ─────────────────────────────────────────────────────────────
export const createPrescription = async (req, res) => {
  try {
    const {
      appointmentId, patientId, patientName, patientEmail,
      diagnosis, medicines, instructions, followUpDate,
    } = req.body;

    // Get doctor details from DB
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check if prescription already exists for this appointment
    const existing = await Prescription.findOne({ appointmentId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Prescription already issued for this appointment.' });
    }

    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      doctorId: doctor._id.toString(),
      doctorName: doctor.fullName,
      doctorEmail: doctor.email,
      specialty: doctor.specialty,
      diagnosis,
      medicines,
      instructions,
      followUpDate: followUpDate || null,
    });

    res.status(201).json({ success: true, message: 'Prescription issued.', prescription });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/my
// Doctor views prescriptions they issued
// ─────────────────────────────────────────────────────────────
export const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/patient/:patientId
// Doctor/Patient views prescriptions for a patient
// ─────────────────────────────────────────────────────────────
export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/appointment/:appointmentId
// Get prescription for a specific appointment
// ─────────────────────────────────────────────────────────────
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId });
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'No prescription found for this appointment.' });
    }
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/prescriptions/:id
// Get single prescription by ID
// ─────────────────────────────────────────────────────────────
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }
    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/prescriptions/:id
// Doctor updates a prescription
// ─────────────────────────────────────────────────────────────
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    if (prescription.doctorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { diagnosis, medicines, instructions, followUpDate, status } = req.body;
    if (diagnosis)    prescription.diagnosis    = diagnosis;
    if (medicines)    prescription.medicines    = medicines;
    if (instructions) prescription.instructions = instructions;
    if (followUpDate) prescription.followUpDate = followUpDate;
    if (status)       prescription.status       = status;

    await prescription.save();
    res.status(200).json({ success: true, message: 'Prescription updated.', prescription });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};