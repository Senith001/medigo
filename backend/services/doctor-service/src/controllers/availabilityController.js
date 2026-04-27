import Availability from "../models/Availability.js";

// Helper: parse "09:00 AM" → minutes
const parseTimeToMinutes = (t) => {
  if (!t) return 0;
  const clean = t.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/)
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3];
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return h * 60 + m;
};

// Helper: calculate maxPatients from time range
const calcMaxPatients = (startTime, endTime, interval = 30) => {
  try {
    const diff = parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
    return diff > 0 ? Math.floor(diff / interval) : 10;
  } catch {
    return 10;
  }
};

// @desc  Create availability — with duplicate + telemedicine conflict check
// @route POST /api/doctors/:doctorId/availability
export const createAvailability = async (req, res) => {
  try {
    const {
      day, date, startTime, endTime,
      hospital, location, fee,
      patientInterval, consultationType,
      maxPatients: maxPatientsBody
    } = req.body;

    const doctorId = req.body.doctorId || req.params.doctorId;

    if (!doctorId) return res.status(400).json({ success: false, message: "Doctor ID is required." });
    if (!day) return res.status(400).json({ success: false, message: "Day is required." });
    if (!startTime) return res.status(400).json({ success: false, message: "Start time is required." });
    if (!endTime) return res.status(400).json({ success: false, message: "End time is required." });
    if (!hospital) return res.status(400).json({ success: false, message: "Hospital name is required." });
    if (!location) return res.status(400).json({ success: false, message: "Location is required." });

    // ✅ FIX 1: Time logic validation
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);
    if (endMins <= startMins) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time."
      });
    }

    // ✅ FIX 2: Duplicate slot conflict check
    // Same doctor + same day + same hospital + overlapping time = conflict
    const conflictQuery = {
      doctorId,
      day,
      hospital,
      isAvailable: true,
    };
    // If specific date given, check that date too
    if (date) conflictQuery.date = date;

    const existing = await Availability.find(conflictQuery);

    for (const slot of existing) {
      const existStart = parseTimeToMinutes(slot.startTime);
      const existEnd = parseTimeToMinutes(slot.endTime);
      // Check overlap: new slot overlaps if start < existEnd AND end > existStart
      if (startMins < existEnd && endMins > existStart) {
        return res.status(409).json({
          success: false,
          message: `Time conflict: You already have a session at ${slot.hospital} from ${slot.startTime} to ${slot.endTime} on ${slot.day}.`
        });
      }
    }

    // ✅ FIX 3: Telemedicine conflict check
    // Same doctor + same time + telemedicine already booked = conflict
    if (consultationType === 'telemedicine' || consultationType === 'both') {
      const teleConflict = await Availability.findOne({
        doctorId,
        day,
        consultationType: { $in: ['telemedicine', 'both'] },
        isAvailable: true,
        ...(date && { date }),
      });

      if (teleConflict) {
        const tStart = parseTimeToMinutes(teleConflict.startTime);
        const tEnd = parseTimeToMinutes(teleConflict.endTime);
        if (startMins < tEnd && endMins > tStart) {
          return res.status(409).json({
            success: false,
            message: `Telemedicine conflict: You already have an online session from ${teleConflict.startTime} to ${teleConflict.endTime} on ${teleConflict.day}.`
          });
        }
      }
    }

    const maxPatients = maxPatientsBody || calcMaxPatients(startTime, endTime, patientInterval || 30);

    const availability = await Availability.create({
      doctorId,
      day,
      date: date || null,
      startTime,
      endTime,
      hospital,
      location,
      fee: fee || 0,
      maxPatients,
      patientInterval: patientInterval || 30,
      consultationType: consultationType || 'in-person',
      isAvailable: true,
      bookedCount: 0,
    });

    res.status(201).json({ success: true, data: availability });

  } catch (error) {
    console.error("createAvailability error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all availability
// @route GET /api/availability
export const getAllAvailability = async (req, res) => {
  try {
    const availabilities = await Availability.find({});
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get availability by doctor ID — sorted by day+time
// @route GET /api/doctors/:doctorId/availability
export const getAvailabilityByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilities = await Availability.find({ doctorId }).sort({ day: 1, startTime: 1 });
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update availability
// @route PUT /api/availability/:id
export const updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!availability) return res.status(404).json({ success: false, message: "Session not found." });
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete availability
// @route DELETE /api/availability/:id
export const deleteAvailability = async (req, res) => {
  try {
    const deleted = await Availability.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Session not found." });
    res.status(200).json({ success: true, message: "Session removed successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Internal: Update bookedCount
// @route PUT /api/availability/internal/:id/occupancy
export const internalUpdateOccupancy = async (req, res) => {
  try {
    const { increment } = req.body;
    const availability = await Availability.findById(req.params.id);
    if (!availability) return res.status(404).json({ success: false, message: "Session not found." });

    if (increment > 0 && availability.bookedCount >= availability.maxPatients) {
      return res.status(400).json({ success: false, message: "Session is at full capacity." });
    }

    availability.bookedCount = Math.max(0, availability.bookedCount + increment);
    await availability.save();
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAvailability = createAvailability;
export const getAvailability = getAvailabilityByDoctorId;
export const updateOccupancy = internalUpdateOccupancy;