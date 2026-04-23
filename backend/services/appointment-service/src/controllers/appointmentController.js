const Appointment = require('../models/Appointment');
const { publishEvent } = require('../config/rabbitmq');
const axios = require('axios');

// ─────────────────────────────────────────────────────────────
// Helper: Get doctor-service _id from email
// ─────────────────────────────────────────────────────────────
const getDoctorProfileId = async (email) => {
  try {
    const res = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/profile/${email}`,
      { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
    )
    return res.data.data?._id?.toString() || null
  } catch (err) {
    console.error('getDoctorProfileId failed:', err.message)
    return null
  }
}

// Helper: sync telemedicine-service when appointment date/time changes.
const syncTelemedicineAppointmentUpdate = async (appointment) => {
  try {
    await axios.put(
      `${process.env.TELEMEDICINE_SERVICE_URL}/api/telemedicine/internal/appointment-updated`,
      {
        appointmentId: appointment._id,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
      },
      { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
    )
  } catch (syncError) {
    console.error('Telemedicine sync failed for appointment update:', syncError.message)
  }
}

// Helper: sync telemedicine-service when a telemedicine appointment is confirmed.
const syncTelemedicineAppointmentConfirmation = async (appointment) => {
  try {
    await axios.post(
      `${process.env.TELEMEDICINE_SERVICE_URL}/api/telemedicine/internal/from-appointment`,
      { appointmentId: appointment._id },
      { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
    )
  } catch (syncError) {
    console.error('Telemedicine sync failed for appointment confirmation:', syncError.message)
  }
}

// Helper: sync telemedicine-service when a telemedicine appointment is completed or cancelled.
const syncTelemedicineAppointmentStatus = async (appointment, message) => {
  try {
    await axios.put(
      `${process.env.TELEMEDICINE_SERVICE_URL}/api/telemedicine/internal/appointment-updated`,
      {
        appointmentId: appointment._id,
        status: appointment.status,
      },
      { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
    )
  } catch (syncError) {
    console.error(message, syncError.message)
  }
}

// Helper: sync doctor-service to update session occupancy.
const updateDoctorSessionOccupancy = async (sessionId, increment) => {
  try {
    if (!sessionId) return
    await axios.put(
      `${process.env.DOCTOR_SERVICE_URL}/api/availability/internal/${sessionId}/occupancy`,
      { increment },
      { headers: { 'x-service-secret': process.env.SERVICE_SECRET } }
    )
  } catch (err) {
    console.error('Failed to sync doctor session occupancy:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/appointments
// Book a new appointment (Patient only)
// ─────────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, sessionId, appointmentDate, timeSlot, type, reason } = req.body

    const patientId = req.user.id
    const patientName = req.user.name
    const patientEmail = req.user.email

    // ── Step 1: Fetch doctor details from doctor-service ──────
    let doctorName, doctorEmail, specialty, hospital, fee

    try {
      const doctorRes = await axios.get(
        `${process.env.DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`,
        { headers: { Authorization: req.headers.authorization } }
      )
      const doctor = doctorRes.data.data || doctorRes.data.doctor || doctorRes.data
      doctorName = doctor.fullName || doctor.name || req.body.doctorName
      doctorEmail = doctor.email || req.body.doctorEmail
      specialty = doctor.specialty || req.body.specialty
      hospital = doctor.hospital || req.body.hospital || null
      fee = doctor.consultationFee || doctor.fee || req.body.fee || 0
    } catch (err) {
      console.warn('Doctor-service unavailable, using request body fallback.')
      doctorName = req.body.doctorName
      doctorEmail = req.body.doctorEmail
      specialty = req.body.specialty
      hospital = req.body.hospital || null
      fee = req.body.fee || 0
    }

    // ── Validation ────────────────────────────────────────────
    if (!doctorName || !doctorEmail || !specialty) {
      return res.status(400).json({
        message: 'Mandatory specialist metadata (Name, Email, or Specialty) is missing.',
        required: {
          doctorName: !!doctorName,
          doctorEmail: !!doctorEmail,
          specialty: !!specialty,
        },
      })
    }

    // ── Step 1.5: Check Session Capacity + snapshot position ────
    let patientNumber = null
    let sessionMaxPatients = null
    if (sessionId) {
      try {
        const availRes = await axios.get(
          `${process.env.DOCTOR_SERVICE_URL}/api/availability/doctor/${doctorId}`
        )
        const session = availRes.data.data?.find(s => s._id === sessionId)
        if (session) {
          if (session.bookedCount >= session.maxPatients) {
            return res.status(400).json({
              message: 'This session is at full capacity. Please select another time or date.',
            })
          }
          // Snapshot position: next patient number after current bookedCount
          patientNumber = (session.bookedCount || 0) + 1
          sessionMaxPatients = session.maxPatients || null
        }
      } catch (err) {
        console.warn('Could not verify session capacity, proceeding anyway.')
      }
    }

    // ── Step 2: Conflict check + smart slot logic ─────────────
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(`${appointmentDate}T00:00:00.000Z`),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    })

    if (existing) {
      // Case 1: Same patient + unpaid → redirect
      if (existing.patientId === patientId && existing.paymentStatus === 'unpaid') {
        return res.status(200).json({
          message: 'Redirecting to your existing pending reservation.',
          appointment: existing,
        })
      }

      // Case 2: Same patient + processing → redirect
      if (existing.patientId === patientId && existing.paymentStatus === 'processing') {
        return res.status(200).json({
          message: 'You already have a pending bank transfer for this slot.',
          appointment: existing,
        })
      }

      // Case 3: Expired unpaid → free slot
      const ageMs = Date.now() - new Date(existing.createdAt).getTime()
      const holdMs = (parseInt(process.env.SLOT_HOLD_MINUTES) || 30) * 60 * 1000
      const isExpired = existing.status === 'pending'
        && existing.paymentStatus === 'unpaid'
        && ageMs > holdMs

      if (isExpired) {
        existing.status = 'cancelled'
        existing.cancelledBy = 'admin'
        existing.cancellationReason = 'Auto-cancelled: payment not completed within hold period.'
        await existing.save()
        if (existing.sessionId) await updateDoctorSessionOccupancy(existing.sessionId, -1)
        console.log(`Auto-cancelled expired appointment ${existing._id} — slot freed.`)

      } else if (existing.paymentStatus === 'processing') {
        // Case 4: Different patient + processing → block
        return res.status(409).json({
          message: 'This slot is held by a pending bank transfer. Please choose another slot.',
        })
      } else {
        // Case 5: Confirmed or genuinely booked → block
        return res.status(409).json({
          message: 'This time slot is already booked.',
        })
      }
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
      sessionId: sessionId || null,
      patientNumber,
      maxPatients: sessionMaxPatients,
    })

    // ── Step 3.5: Increment session occupancy ─────────────────
    if (sessionId) {
      await updateDoctorSessionOccupancy(sessionId, 1)
    }

    // ── Step 4: Publish RabbitMQ event ────────────────────────
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
    })

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment,
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked.' })
    }
    console.error('bookAppointment error:', error)
    res.status(500).json({ message: 'Server error while booking appointment.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments
// ─────────────────────────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  try {
    const { role, id, email } = req.user;
    console.log('getMyAppointments req.user:', req.user);
    const { status, page = 1, limit = 10 } = req.query

    const filter = {}

    if (role === 'patient') {
      filter.patientId = id
    } else if (role === 'doctor') {
      // ✅ FIX: email use කරලා doctor-service _id fetch
      const doctorProfileId = await getDoctorProfileId(email)
      filter.doctorId = doctorProfileId || id
    } else {
      // ✅ FIX: Prevent getting all appointments when an admin logs in
      // Standard route shouldn't return all appointments unless explicitly using /admin/all
      filter._id = null; // Forces empty result if role is unsupported here
    }

    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Appointment.countDocuments(filter)
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      appointments,
    })
  } catch (error) {
    console.error('getMyAppointments error:', error)
    res.status(500).json({ message: 'Server error fetching appointments.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/:id
// ─────────────────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })

    const { role, id } = req.user
    if (
      role !== 'admin' &&
      appointment.patientId !== id &&
      appointment.doctorId !== id
    ) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    res.status(200).json(appointment)
  } catch (error) {
    console.error('getAppointmentById error:', error)
    res.status(500).json({ message: 'Server error fetching appointment.' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id — Reschedule
// ─────────────────────────────────────────────────────────────
const modifyAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })

    if (appointment.patientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' })
    }

    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot modify an appointment with status: ${appointment.status}`,
      })
    }

    const { appointmentDate, timeSlot, reason, sessionId } = req.body
    const dateOrTimeChanged = Boolean(appointmentDate || timeSlot)

    // Handle session occupancy swap if sessionId changed
    if (sessionId && sessionId !== appointment.sessionId) {
      // Decrement occupancy for old session
      if (appointment.sessionId) {
        await updateDoctorSessionOccupancy(appointment.sessionId, -1)
      }
      // Increment occupancy for new session
      await updateDoctorSessionOccupancy(sessionId, 1)
      appointment.sessionId = sessionId
    }

    if (appointmentDate || timeSlot) {
      const newDate = appointmentDate
        ? new Date(`${appointmentDate}T00:00:00.000Z`)
        : appointment.appointmentDate
      const newSlot = timeSlot || appointment.timeSlot

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        timeSlot: newSlot,
        status: { $in: ['pending', 'confirmed'] },
      })

      if (conflict) return res.status(409).json({ message: 'The new time slot is not available.' })

      if (appointmentDate) appointment.appointmentDate = newDate
      if (timeSlot) appointment.timeSlot = newSlot
    }

    if (reason !== undefined) appointment.reason = reason
    await appointment.save()

    await publishEvent('appointment.updated', {
      appointmentId: appointment._id,
      patientEmail: appointment.patientEmail,
      doctorEmail: appointment.doctorEmail,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      patientPhone: req.user.phone || null,
      doctorPhone: null,
      hospital: appointment.hospital,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
    })

    if (appointment.type === 'telemedicine' && dateOrTimeChanged) {
      await syncTelemedicineAppointmentUpdate(appointment)
    }

    res.status(200).json({ message: 'Appointment updated successfully.', appointment })
  } catch (error) {
    console.error('modifyAppointment error:', error)
    res.status(500).json({ message: 'Server error modifying appointment.' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/cancel
// ─────────────────────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })

    const { role, id } = req.user
    const isInternal = req.headers['x-service-secret'] === process.env.SERVICE_SECRET

    if (
      !isInternal &&
      role !== 'admin' &&
      appointment.patientId !== id &&
      appointment.doctorId !== id
    ) {
      return res.status(403).json({ message: 'Access denied.' })
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled.' })
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment.' })
    }

    appointment.status = 'cancelled'
    appointment.cancelledBy = isInternal ? 'admin' : role
    appointment.cancellationReason = req.body.reason || 'No reason provided'
    await appointment.save()

    if (appointment.sessionId) {
      await updateDoctorSessionOccupancy(appointment.sessionId, -1)
    }

    await publishEvent('appointment.cancelled', {
      appointmentId: appointment._id,
      patientEmail: appointment.patientEmail,
      doctorEmail: appointment.doctorEmail,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      patientPhone: null,
      doctorPhone: null,
      hospital: appointment.hospital,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      cancelledBy: appointment.cancelledBy,
      cancellationReason: appointment.cancellationReason,
    })

    if (appointment.type === 'telemedicine') {
      await syncTelemedicineAppointmentStatus(
        appointment,
        'Telemedicine sync failed for appointment cancellation:'
      )
    }

    res.status(200).json({ message: 'Appointment cancelled.', appointment })
  } catch (error) {
    console.error('cancelAppointment error:', error)
    res.status(500).json({ message: 'Server error cancelling appointment.' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/status — Doctor/Admin only
// ─────────────────────────────────────────────────────────────
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body
    const allowedStatuses = ['confirmed', 'completed', 'no-show']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })

    const { role, email } = req.user

    // ✅ FIX: doctor role check using email → doctor-service _id
    if (role !== 'admin') {
      const doctorProfileId = await getDoctorProfileId(email)
      if (!doctorProfileId || appointment.doctorId.toString() !== doctorProfileId) {
        return res.status(403).json({ message: 'Access denied.' })
      }
    }

    appointment.status = status
    if (meetingLink) appointment.meetingLink = meetingLink
    await appointment.save()

    if (status === 'confirmed') {
      await publishEvent('appointment.updated', {
        appointmentId: appointment._id,
        patientEmail: appointment.patientEmail,
        doctorEmail: appointment.doctorEmail,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        patientPhone: null,
        doctorPhone: null,
        hospital: appointment.hospital,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        meetingLink: appointment.meetingLink,
        confirmed: true,
      })

      if (appointment.type === 'telemedicine' && appointment.paymentStatus === 'paid') {
        await syncTelemedicineAppointmentConfirmation(appointment)
      }
    }

    if (appointment.type === 'telemedicine' && status === 'completed') {
      await syncTelemedicineAppointmentStatus(
        appointment,
        'Telemedicine sync failed for appointment completion:'
      )
    }

    res.status(200).json({
      message: `Appointment status updated to ${status}.`,
      appointment,
    })
  } catch (error) {
    console.error('updateAppointmentStatus error:', error)
    res.status(500).json({ message: 'Server error updating status.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/doctor/:doctorId/availability
// ─────────────────────────────────────────────────────────────
const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params
    const { date } = req.query

    if (!date) return res.status(400).json({ message: 'Date query parameter is required.' })

    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(`${date}T23:59:59.999Z`)

    const booked = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { paymentStatus: 'paid' },
        { paymentStatus: 'processing' },
        {
          paymentStatus: 'unpaid',
          createdAt: {
            $gte: new Date(
              Date.now() - (parseInt(process.env.SLOT_HOLD_MINUTES) || 30) * 60 * 1000
            ),
          },
        },
      ],
    }).select('timeSlot -_id')

    res.status(200).json({
      doctorId,
      date,
      bookedSlots: booked.map(a => a.timeSlot),
    })
  } catch (error) {
    console.error('getDoctorAvailability error:', error)
    res.status(500).json({ message: 'Server error fetching availability.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/search
// ─────────────────────────────────────────────────────────────
const searchDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query
    if (!specialty) return res.status(400).json({ message: 'Specialty query parameter is required.' })

    const response = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/search`,
      { params: { specialty }, headers: { Authorization: req.headers.authorization } }
    )

    res.status(200).json(response.data)
  } catch (error) {
    console.error('searchDoctorsBySpecialty error:', error.message)
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Error searching doctors.',
    })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/admin/all — Admin only
// ─────────────────────────────────────────────────────────────
const getAllAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = {}
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Appointment.countDocuments(filter)
    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({ total, page: parseInt(page), appointments })
  } catch (error) {
    res.status(500).json({ message: 'Server error.' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/internal/payment-status
// Internal — payment-service only
// ─────────────────────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { appointmentId, paymentStatus } = req.body

    if (!appointmentId || !paymentStatus) {
      return res.status(400).json({ message: 'appointmentId and paymentStatus are required.' })
    }

    const allowed = ['unpaid', 'processing', 'paid', 'refunded']
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid paymentStatus. Allowed: ${allowed.join(', ')}`,
      })
    }

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })

    appointment.paymentStatus = paymentStatus

    // ✅ Auto-confirm when payment completed
    if (paymentStatus === 'paid' && appointment.status === 'pending') {
      appointment.status = 'confirmed'
    }

    await appointment.save()

    res.status(200).json({
      message: `Payment status updated to ${paymentStatus}.`,
      appointment,
    })
  } catch (error) {
    console.error('updatePaymentStatus error:', error)
    res.status(500).json({ message: 'Server error updating payment status.' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/appointments/internal/:id
// ─────────────────────────────────────────────────────────────
const getInternalAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' })
    res.status(200).json({ appointment })
  } catch (error) {
    console.error('getInternalAppointmentDetails error:', error)
    res.status(500).json({ message: 'Server error fetching internal appointment payload.' })
  }
}

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
}