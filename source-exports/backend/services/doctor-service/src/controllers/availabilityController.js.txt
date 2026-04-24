import Availability from "../models/Availability.js";

// @desc    Create availability
// @route   POST /api/availability
export const createAvailability = async (req, res) => {
  try {
    const { day, date, startTime, endTime, hospital, location, fee, patientInterval, consultationType } = req.body;
    const doctorId = req.body.doctorId || req.params.doctorId;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required" });
    }

    // Helper: Calculate max patients if not provided
    let maxPatients = req.body.maxPatients;
    if (!maxPatients && startTime && endTime) {
      try {
        const cleanTime = (t) => {
          if (!t) return t;
          let match = t.match(/(\d{1,2}:\d{2})\s?([AP]M)/i);
          if (match) return `${match[1]} ${match[2].toUpperCase()}`;
          match = t.match(/(\d{1,2})\s?([AP]M)/i);
          if (match) return `${match[1]}:00 ${match[2].toUpperCase()}`;
          return t;
        };

        const cS = cleanTime(startTime);
        const cE = cleanTime(endTime);

        const parseTime = (t) => {
          const parts = t.split(' ');
          let [hours, minutes] = parts[0].split(':');
          if (hours === '12') hours = '00';
          if (parts[1] === 'PM') hours = parseInt(hours, 10) + 12;
          return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
        };
        const diff = parseTime(cE) - parseTime(cS);
        const interval = patientInterval || 30;
        maxPatients = Math.floor(diff / interval);
      } catch (err) {
        maxPatients = 10; // Fallback
      }
    }

    const availability = await Availability.create({
      doctorId,
      day,
      date,
      startTime,
      endTime,
      hospital,
      location,
      fee,
      maxPatients: maxPatients || 10,
      patientInterval: patientInterval || 30,
      consultationType: consultationType || 'in-person',
      isAvailable: true
    });
    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all availability
// @route   GET /api/availability
export const getAllAvailability = async (req, res) => {
  try {
    const availabilities = await Availability.find({});
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get availability by doctor ID
// @route   GET /api/availability/doctor/:doctorId
export const getAvailabilityByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilities = await Availability.find({ doctorId });
    res.status(200).json({ success: true, data: availabilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update availability
// @route   PUT /api/availability/:id
export const updateAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
export const deleteAvailability = async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Availability removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Internal: Update bookedCount (Secret key required)
// @route   PUT /api/availability/internal/:id/occupancy
export const internalUpdateOccupancy = async (req, res) => {
  try {
    const { increment } = req.body; // should be 1 or -1
    const availability = await Availability.findById(req.params.id);
    
    if (!availability) return res.status(404).json({ success: false, message: "Session not found" });
    
    // Check capacity if incrementing
    if (increment > 0 && availability.bookedCount >= availability.maxPatients) {
      return res.status(400).json({ success: false, message: "Session is already at full capacity" });
    }

    availability.bookedCount = Math.max(0, availability.bookedCount + increment);
    await availability.save();
    
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Aliases for compatibility with newer code
export const addAvailability = createAvailability;
export const getAvailability = getAvailabilityByDoctorId;
export const updateOccupancy = internalUpdateOccupancy;