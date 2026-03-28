import Doctor from '../models/Doctor.js';

// ─────────────────────────────────────────────────────────────
// GET /api/availability/me
// Doctor views their availability
// ─────────────────────────────────────────────────────────────
export const getMyAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('availability fullName specialty');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.status(200).json({ success: true, availability: doctor.availability });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/availability/me
// Doctor sets/updates their availability
// ─────────────────────────────────────────────────────────────
export const updateMyAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ success: false, message: 'Availability must be an array.' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { $set: { availability } },
      { new: true, runValidators: true }
    ).select('availability fullName');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    res.status(200).json({ success: true, message: 'Availability updated.', availability: doctor.availability });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/availability/:doctorId
// Public — get doctor availability
// ─────────────────────────────────────────────────────────────
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId).select('availability fullName specialty fee hospital');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};