const Appointment = require('../models/Appointment');
const { publishEvent } = require('../config/rabbitmq');
const axios = require('axios');

// ─────────────────────────────────────────────────────────────
// POST /api/appointments
// Book a new appointment (Patient only)
// Doctor details auto-fetched from doctor-service
// ─────────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, reason } = req.body;

    const patientId    = req.user.id;
    const patientName  = req.user.name;
    const patientEmail = req.user.email;

    // ── Step 1: Fetch doctor details from doctor-service ─────
    let doctorName, doctorEmail, specialty, hospital, fee;

    try {
      const doctorRes = await axios.get(
        `${process.env.DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`,
        { headers: { Authorization: req.headers.authorization } }
      );

      const doctor = doctorRes.data.doctor || doctorRes.data;

      // Use values from service if they exist, otherwise use fallbacks from req.body
      doctorName  = doctor.fullName  || doctor.name  || req.body.doctorName;
      doctorEmail = doctor.email || req.body.doctorEmail;
      specialty   = doctor.specialty || req.body.specialty;
      hospital    = doctor.hospital  || req.body.hospital || null;
      fee         = doctor.fee       || req.body.fee || 0;

    } catch (err) {
      console.warn('Doctor-service unavailable, using request body fallback.');
      doctorName  = req.body.doctorName;
      doctorEmail = req.body.doctorEmail;
      specialty   = req.body.specialty;
      hospital    = req.body.hospital    || null;
      fee         = req.body.fee         || 0;
    }

    // ── Validation: No Dummy Data ────────────────────────────
    if (!doctorName || !doctorEmail || !specialty) {
      return res.status(400).json({ 
        message: 'Clinical Authorization Failure: Mandatory specialist metadata (Name, Email, or Specialty) is missing. Real-time data sync required.',
        required: { doctorName: !!doctorName, doctorEmail: !!doctorEmail, specialty: !!specialty }
      });
    }

    // ── Step 2: Check if slot is already taken ────────────────
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(`${appointmentDate}T00:00:00.000Z`),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    // ── Step 3: Create appointment ────────────────────────────
    const appointment = await Appointment.create({
      patientId,
      patientName,
      patientEmail,
      doctorId,
      doctorName,
      doctorEmail,
      specialty,
      hospital,
      appointmentDate,
      timeSlot,
      type: type || 'telemedicine',
      reason,
      fee,
    });

    // ── Step 4: Publish event to RabbitMQ ─────────────────────
    await publishEvent('appointment.booked', {
      appointmentId: appointment._id,
      patientId,
      patientName,
      patientEmail,
      patientPhone: req.user.phone || null,
      doctorId,
      doctorName,
      doctorEmail,
      doctorPhone: null,
      hospital,
      specialty,
      appointmentDate,
      timeSlot,
      type: appointment.type,
    });

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }
    console.error('bookAppointment error:', error);
    res.status(500).json({ message: 'Server error while booking appointment.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments
// Get all appointments for the logged-in user
// ─────────────────────────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role === 'patient') filter.patientId = id;
    else if (role === 'doctor') filter.doctorId = id;
    // admin sees all

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments,
    });
  } catch (error) {
    console.error('getMyAppointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/:id
// ─────────────────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const { role, id } = req.user;
    if (role !== 'admin' && appointment.patientId !== id && appointment.doctorId !== id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('getAppointmentById error:', error);
    res.status(500).json({ message: 'Server error fetching appointment.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id  — Reschedule
// ─────────────────────────────────────────────────────────────
const modifyAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    if (appointment.patientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({ message: `Cannot modify an appointment with status: ${appointment.status}` });
    }

    const { appointmentDate, timeSlot, reason } = req.body;

    if (appointmentDate || timeSlot) {
      const newDate = appointmentDate ? new Date(`${appointmentDate}T00:00:00.000Z`) : appointment.appointmentDate;
      const newSlot = timeSlot || appointment.timeSlot;

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        timeSlot: newSlot,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (conflict) return res.status(409).json({ message: 'The new time slot is not available.' });

      if (appointmentDate) appointment.appointmentDate = newDate;
      if (timeSlot) appointment.timeSlot = newSlot;
    }

    if (reason !== undefined) appointment.reason = reason;
    await appointment.save();

    await publishEvent('appointment.updated', {
      appointmentId:   appointment._id,
      patientEmail:    appointment.patientEmail,
      doctorEmail:     appointment.doctorEmail,
      patientName:     appointment.patientName,
      doctorName:      appointment.doctorName,
      patientPhone:    null,
      doctorPhone:     null,
      hospital:        appointment.hospital,
      appointmentDate: appointment.appointmentDate,
      timeSlot:        appointment.timeSlot,
    });

    res.status(200).json({ message: 'Appointment updated successfully.', appointment });
  } catch (error) {
    console.error('modifyAppointment error:', error);
    res.status(500).json({ message: 'Server error modifying appointment.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/cancel
// ─────────────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const { role, id } = req.user;
    if (role !== 'admin' && appointment.patientId !== id && appointment.doctorId !== id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Appointment is already cancelled.' });
    if (appointment.status === 'completed')  return res.status(400).json({ message: 'Cannot cancel a completed appointment.' });

    appointment.status = 'cancelled';
    appointment.cancelledBy = role;
    appointment.cancellationReason = req.body.reason || 'No reason provided';
    await appointment.save();

    await publishEvent('appointment.cancelled', {
      appointmentId:      appointment._id,
      patientEmail:       appointment.patientEmail,
      doctorEmail:        appointment.doctorEmail,
      patientName:        appointment.patientName,
      doctorName:         appointment.doctorName,
      patientPhone:       null,
      doctorPhone:        null,
      hospital:           appointment.hospital,
      appointmentDate:    appointment.appointmentDate,
      timeSlot:           appointment.timeSlot,
      cancelledBy:        role,
      cancellationReason: appointment.cancellationReason,
    });

    res.status(200).json({ message: 'Appointment cancelled.', appointment });
  } catch (error) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/status  — Doctor/Admin only
// ─────────────────────────────────────────────────────────────
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;
    const allowedStatuses = ['confirmed', 'completed', 'no-show'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });

    const { role, id } = req.user;
    if (role !== 'admin' && appointment.doctorId !== id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    appointment.status = status;
    if (meetingLink) appointment.meetingLink = meetingLink;
    await appointment.save();

    // Publish confirmation event when doctor confirms
    if (status === 'confirmed') {
      await publishEvent('appointment.updated', {
        appointmentId:   appointment._id,
        patientEmail:    appointment.patientEmail,
        doctorEmail:     appointment.doctorEmail,
        patientName:     appointment.patientName,
        doctorName:      appointment.doctorName,
        patientPhone:    null,
        doctorPhone:     null,
        hospital:        appointment.hospital,
        appointmentDate: appointment.appointmentDate,
        timeSlot:        appointment.timeSlot,
        meetingLink:     appointment.meetingLink,
        confirmed:       true,
      });
    }

    res.status(200).json({ message: `Appointment status updated to ${status}.`, appointment });
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    res.status(500).json({ message: 'Server error updating status.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/doctor/:doctorId/availability
// ─────────────────────────────────────────────────────────────
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: 'Date query parameter is required.' });

    const start = new Date(`${date}T00:00:00.000Z`);
    const end   = new Date(`${date}T23:59:59.999Z`);

    const bookedSlots = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot -_id');

    res.status(200).json({
      doctorId,
      date,
      bookedSlots: bookedSlots.map((a) => a.timeSlot),
    });
  } catch (error) {
    console.error('getDoctorAvailability error:', error);
    res.status(500).json({ message: 'Server error fetching availability.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/search  — Search doctors by specialty
// ─────────────────────────────────────────────────────────────
const searchDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    if (!specialty) return res.status(400).json({ message: 'Specialty query parameter is required.' });

    const response = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/search`,
      { params: { specialty }, headers: { Authorization: req.headers.authorization } }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('searchDoctorsBySpecialty error:', error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Error searching doctors.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/admin/all  — Admin only
// ─────────────────────────────────────────────────────────────
const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ total, page: parseInt(page), appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/internal/payment-status
// Internal — called by payment-service only (x-service-secret)
// Updates paymentStatus on an appointment after Stripe confirms
// ─────────────────────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { appointmentId, paymentStatus } = req.body;

    if (!appointmentId || !paymentStatus) {
      return res.status(400).json({ message: 'appointmentId and paymentStatus are required.' });
    }

    const allowed = ['unpaid', 'processing', 'paid', 'refunded'];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ message: `Invalid paymentStatus. Allowed: ${allowed.join(', ')}` });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.paymentStatus = paymentStatus;
    await appointment.save();

    res.status(200).json({ message: `Payment status updated to ${paymentStatus}.`, appointment });
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ message: 'Server error updating payment status.' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/internal/:id
// INTERNAL EXCLUSIVE: Fetch trusted appointment details
// ─────────────────────────────────────────────────────────────
const getInternalAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ appointment });
  } catch (error) {
    console.error('getInternalAppointmentDetails error:', error);
    res.status(500).json({ message: 'Server error fetching internal appointment payload' });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  modifyAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  getDoctorAvailability,
  searchDoctorsBySpecialty,
  getAllAppointments,
  getInternalAppointmentDetails,
};