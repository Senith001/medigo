import Doctor from '../models/Doctor.js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateDoctorToken = (doctor) => {
  return jwt.sign(
    { id: doctor._id, userId: doctor._id, email: doctor.email, fullName: doctor.fullName, role: 'doctor' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }
    const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select('+password');
    if (!doctor) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!doctor.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }
    const token = generateDoctorToken(doctor);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: { userId: doctor._id, fullName: doctor.fullName, email: doctor.email, role: 'doctor', isVerified: doctor.isVerified },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};


// ─────────────────────────────────────────────────────────────
// POST /api/doctors/register
// Register a new doctor
// ─────────────────────────────────────────────────────────────
export const registerDoctor = async (req, res) => {
  try {
    const { fullName, email, password, phone, specialty, qualifications, hospital, experience, fee, slmcNumber, bio } = req.body;

    const existing = await Doctor.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const doctor = await Doctor.create({
      fullName, email, password, phone,
      specialty, qualifications, hospital,
      experience: experience || 0,
      fee: fee || 0,
      slmcNumber, bio,
    });

    const doctorObj = doctor.toObject();
    delete doctorObj.password;

    res.status(201).json({ success: true, message: 'Doctor registered successfully.', doctor: doctorObj });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/doctors/me
// Get logged-in doctor profile
// ─────────────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/doctors/me
// Update doctor profile
// ─────────────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName', 'phone', 'specialty', 'qualifications',
      'hospital', 'experience', 'fee', 'bio', 'languages',
      'consultationType', 'slmcNumber', 'profilePicture',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({ success: true, message: 'Profile updated.', doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/doctors
// Get all verified & active doctors (public)
// ─────────────────────────────────────────────────────────────
export const getAllDoctors = async (req, res) => {
  try {
    const { specialty, hospital, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (hospital)  filter.hospital  = { $regex: hospital,  $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter)
      .select('-password')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, page: parseInt(page), doctors });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/doctors/search
// Search doctors by specialty
// ─────────────────────────────────────────────────────────────
export const searchDoctors = async (req, res) => {
  try {
    const { specialty, name } = req.query;
    const filter = { isActive: true };
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (name)      filter.fullName  = { $regex: name,      $options: 'i' };

    const doctors = await Doctor.find(filter).select('-password').sort({ rating: -1 });
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/doctors/:id
// Get a single doctor by ID
// ─────────────────────────────────────────────────────────────
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/doctors/:id/appointments
// Doctor views their appointments (calls appointment-service)
// ─────────────────────────────────────────────────────────────
export const getMyAppointments = async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments`,
      { headers: { Authorization: req.headers.authorization } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Error fetching appointments.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/doctors/appointments/:appointmentId/status
// Doctor accepts or rejects an appointment
// ─────────────────────────────────────────────────────────────
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, meetingLink } = req.body; // confirmed | no-show | completed

    const response = await axios.put(
      `${process.env.APPOINTMENT_SERVICE_URL}/api/appointments/${appointmentId}/status`,
      { status, meetingLink },
      { headers: { Authorization: req.headers.authorization } }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Error updating appointment.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Admin routes
// ─────────────────────────────────────────────────────────────
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.status(200).json({ success: true, total, doctors });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.status(200).json({ success: true, message: 'Doctor verified.', doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

export const toggleDoctorStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    doctor.isActive = !doctor.isActive;
    await doctor.save();

    res.status(200).json({ success: true, message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'}.`, doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};