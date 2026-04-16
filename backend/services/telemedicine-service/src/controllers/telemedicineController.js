import TelemedicineSession from "../models/TelemedicineSession.js";
import generateRoomName from "../utils/generateRoomName.js";
import { generateJitsiMeetingLink } from "../services/jitsiService.js";
import axios from "axios";

const getUserIdentity = (user) => user.id || user.userId;
const TELEMEDICINE_TIMEZONE = "Asia/Colombo";

const formatLocalDate = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TELEMEDICINE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatLocalTime = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TELEMEDICINE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

// Keep stored UTC timestamps untouched, but expose stable local display fields.
const toSessionResponse = (sessionDoc) => {
  const session = sessionDoc?.toObject ? sessionDoc.toObject() : sessionDoc;

  if (!session?.scheduledAt) {
    return {
      ...session,
      appointmentDate: null,
      timeSlot: null,
      scheduledAtLocal: null,
    };
  }

  const start = new Date(session.scheduledAt);
  if (Number.isNaN(start.getTime())) {
    return {
      ...session,
      appointmentDate: null,
      timeSlot: null,
      scheduledAtLocal: null,
    };
  }

  // Telemedicine slots are fixed 30-minute windows; end time is derived from start.
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const appointmentDate = formatLocalDate(start);
  const startTime = formatLocalTime(start);
  const endTime = formatLocalTime(end);

  return {
    ...session,
    appointmentDate,
    timeSlot: `${startTime} - ${endTime}`,
    scheduledAtLocal: `${appointmentDate} ${startTime}`,
  };
};

// Check whether the current user is allowed to view or join this session.
const canAccessSession = (session, user) => {
  return (
    user.role === "admin" ||
    session.patientId === getUserIdentity(user) ||
    session.doctorId === getUserIdentity(user)
  );
};

// Only sessions that have not started yet can be updated or deleted.
const isUpcomingSession = (session) => {
  const allowedStatuses = ["scheduled", "waiting"];

  if (!allowedStatuses.includes(session.status)) {
    return false;
  }

  if (session.scheduledAt && new Date(session.scheduledAt) <= new Date()) {
    return false;
  }

  return true;
};

// Define which status changes are allowed from each current status.
const allowedStatusTransitions = {
  scheduled: ["waiting", "active", "cancelled"],
  waiting: ["active", "ended", "cancelled"],
  active: ["ended"],
  ended: [],
  cancelled: [],
};

// Fetch trusted appointment details from appointment-service.
const fetchAppointmentDetails = async (appointmentId) => {
  const appointmentServiceUrl =
    process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5005";

  const response = await axios.get(
    `${appointmentServiceUrl}/api/appointments/internal/${appointmentId}`,
    {
      headers: {
        "x-service-secret": process.env.SERVICE_SECRET,
      },
    }
  );

  return response.data.appointment || response.data;
};

// Fetch appointment details safely so caller routes can return controlled responses.
const fetchAppointmentDetailsSafe = async (appointmentId) => {
  try {
    const appointment = await fetchAppointmentDetails(appointmentId);
    return { appointment };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        error: {
          statusCode: 404,
          message: "Appointment not found.",
        },
      };
    }

    return {
      error: {
        statusCode: 503,
        message: "Appointment service is unavailable. Please try again.",
      },
    };
  }
};

// Admin-only fallback payload used when appointment-service is unavailable.
const buildAdminManualAppointmentFallback = (appointmentId, payload) => {
  const requiredFields = [
    "patientId",
    "patientName",
    "doctorId",
    "doctorName",
    "appointmentDate",
    "timeSlot",
  ];

  const missingFields = requiredFields.filter(
    (field) => !payload[field] || String(payload[field]).trim() === ""
  );

  if (missingFields.length > 0) {
    return {
      error: {
        statusCode: 400,
        message: `Missing required fields for admin manual creation: ${missingFields.join(", ")}.`,
      },
    };
  }

  return {
    appointment: {
      appointmentId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      appointmentDate: payload.appointmentDate,
      timeSlot: payload.timeSlot,
      type: payload.type || "telemedicine",
      status: payload.status || "confirmed",
      paymentStatus: payload.paymentStatus || "paid",
    },
  };
};

// Build the session start date from appointmentDate and the start of timeSlot.
const parseTimeSlotStart = (timeSlot) => {
  const [startTimeRaw] = String(timeSlot || "").split("-");
  const startTime = startTimeRaw.trim();
  const match = startTime.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }

  return { hours, minutes };
};

// Build UTC scheduledAt from appointment date + slot start, with fallback to existing time.
const getAppointmentScheduledAt = (appointment, fallbackScheduledAt = null) => {
  const baseDate = appointment.appointmentDate || fallbackScheduledAt;
  const appointmentDate = new Date(baseDate);

  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  let parsedTime = parseTimeSlotStart(appointment.timeSlot);

  if (!parsedTime && fallbackScheduledAt) {
    const fallbackDate = new Date(fallbackScheduledAt);
    if (!Number.isNaN(fallbackDate.getTime())) {
      parsedTime = {
        hours: fallbackDate.getHours(),
        minutes: fallbackDate.getMinutes(),
      };
    }
  }

  if (parsedTime) {
    appointmentDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  }

  return appointmentDate;
};

// Shared session creation flow used by both manual and internal routes.
const createSessionForAppointment = async (
  appointmentId,
  user = null,
  fallbackPayload = null
) => {
  if (!appointmentId) {
    return {
      statusCode: 400,
      body: {
        message: "Appointment ID is required.",
      },
    };
  }

  const appointmentResult = await fetchAppointmentDetailsSafe(appointmentId);

  if (appointmentResult.error) {
    // Allow only manual admin creation to fallback when appointment-service is unavailable.
    if (
      appointmentResult.error.statusCode === 503 &&
      user?.role === "admin" &&
      fallbackPayload
    ) {
      const fallback = buildAdminManualAppointmentFallback(
        appointmentId,
        fallbackPayload
      );

      if (fallback.error) {
        return {
          statusCode: fallback.error.statusCode,
          body: {
            message: fallback.error.message,
          },
        };
      }

      appointmentResult.appointment = fallback.appointment;
    } else {
      return {
        statusCode: appointmentResult.error.statusCode,
        body: {
          message: appointmentResult.error.message,
        },
      };
    }
  }

  const appointment = appointmentResult.appointment;

  const patientId = appointment.patientId;
  const patientName = appointment.patientName;
  const doctorId = appointment.doctorId;
  const doctorName = appointment.doctorName;

  if (!patientId || !patientName || !doctorId || !doctorName) {
    return {
      statusCode: 400,
      body: {
        message: "Appointment details are incomplete for session creation.",
      },
    };
  }

  // Telemedicine-service only creates sessions for telemedicine appointments.
  if (appointment.type !== "telemedicine") {
    return {
      statusCode: 400,
      body: {
        message: "Only telemedicine appointments can create a session.",
      },
    };
  }

  if (["cancelled", "completed", "no-show"].includes(appointment.status)) {
    return {
      statusCode: 400,
      body: {
        message: `Cannot create a session for an appointment with status: ${appointment.status}.`,
      },
    };
  }

  if (appointment.status !== "confirmed") {
    return {
      statusCode: 400,
      body: {
        message: "Appointment must be confirmed before creating a telemedicine session.",
      },
    };
  }

  if (appointment.paymentStatus && appointment.paymentStatus !== "paid") {
    return {
      statusCode: 400,
      body: {
        message: "Payment must be completed before creating a telemedicine session.",
      },
    };
  }

  if (user && user.role !== "admin" && getUserIdentity(user) !== doctorId) {
    return {
      statusCode: 403,
      body: {
        message: "Access denied. Only the assigned doctor or admin can create this session.",
      },
    };
  }

  const scheduledAt = getAppointmentScheduledAt(appointment);

  if (!scheduledAt) {
    return {
      statusCode: 400,
      body: {
        message: "Appointment date or time slot is invalid for session creation.",
      },
    };
  }

  // Prevent duplicate sessions for the same appointment.
  const existingSession = await TelemedicineSession.findOne({ appointmentId });

  if (existingSession) {
    return {
      statusCode: 200,
      body: {
        message: "Session already exists for this appointment.",
        session: toSessionResponse(existingSession),
      },
    };
  }

  // Build the room name first, then generate the Jitsi link from it.
  const roomName = generateRoomName(appointmentId, doctorId, patientId);
  const meetingLink = generateJitsiMeetingLink(roomName);

  const session = await TelemedicineSession.create({
    appointmentId,
    patientId,
    patientName,
    doctorId,
    doctorName,
    roomName,
    meetingLink,
    status: "scheduled",
    scheduledAt,
  });

  return {
    statusCode: 201,
    body: {
      message: "Telemedicine session created successfully.",
      session: toSessionResponse(session),
    },
  };
};

const createSession = async (req, res) => {
  try {
    const result = await createSessionForAppointment(
      req.body.appointmentId,
      req.user,
      req.body
    );

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("createSession error:", error.message);

    return res.status(500).json({
      message: "Server error while creating telemedicine session.",
    });
  }
};

const createSessionFromAppointment = async (req, res) => {
  try {
    const result = await createSessionForAppointment(req.body.appointmentId);

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error("createSessionFromAppointment error:", error.message);

    return res.status(500).json({
      message: "Server error while creating session from appointment.",
    });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const {
      status,
      doctorId,
      patientId,
      appointmentId,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (appointmentId) filter.appointmentId = appointmentId;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (parsedPage - 1) * parsedLimit;

    const total = await TelemedicineSession.countDocuments(filter);
    const sessions = await TelemedicineSession.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    return res.status(200).json({
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      sessions: sessions.map(toSessionResponse),
    });
  } catch (error) {
    console.error("getAllSessions error:", error.message);

    return res.status(500).json({
      message: "Server error fetching telemedicine sessions.",
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (!canAccessSession(session, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Return the full session if the current user belongs to it.
    return res.status(200).json(toSessionResponse(session));
  } catch (error) {
    console.error("getSessionById error:", error.message);

    return res.status(500).json({ message: "Server error fetching session." });
  }
};

const getSessionByAppointmentId = async (req, res) => {
  try {
    // This is useful when the frontend only knows the appointment id.
    const session = await TelemedicineSession.findOne({
      appointmentId: req.params.appointmentId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found for appointment.",
      });
    }

    if (!canAccessSession(session, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json(toSessionResponse(session));
  } catch (error) {
    console.error("getSessionByAppointmentId error:", error.message);

    return res.status(500).json({ message: "Server error fetching session." });
  }
};

const joinSession = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (!canAccessSession(session, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Do not allow users to join sessions that are already finished or cancelled.
    if (["ended", "cancelled"].includes(session.status)) {
      return res.status(400).json({
        message: `Cannot join a session with status: ${session.status}.`,
      });
    }

    // The first join moves the session from scheduled to waiting.
    if (session.status === "scheduled") {
      session.status = "waiting";
      await session.save();
    }

    return res.status(200).json({
      message: "Session ready to join.",
      meetingLink: session.meetingLink,
      session: toSessionResponse(session),
    });
  } catch (error) {
    console.error("joinSession error:", error.message);

    return res.status(500).json({ message: "Server error joining session." });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (req.user.role !== "admin" && session.doctorId !== getUserIdentity(req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!isUpcomingSession(session)) {
      return res.status(400).json({
        message: "Only upcoming sessions can be updated.",
      });
    }

    // Only a few editable fields are allowed here.
    const { patientName, doctorName, scheduledAt } = req.body;

    if (patientName !== undefined) {
      session.patientName = patientName;
    }

    if (doctorName !== undefined) {
      session.doctorName = doctorName;
    }

    if (scheduledAt !== undefined) {
      if (scheduledAt && Number.isNaN(new Date(scheduledAt).getTime())) {
        return res.status(400).json({
          message: "scheduledAt must be a valid date.",
        });
      }

      session.scheduledAt = scheduledAt || null;
    }

    await session.save();

    return res.status(200).json({
      message: "Telemedicine session updated successfully.",
      session: toSessionResponse(session),
    });
  } catch (error) {
    console.error("updateSession error:", error.message);

    return res.status(500).json({
      message: "Server error while updating session.",
    });
  }
};

const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Keep session status changes inside the known lifecycle values.
    const allowedStatuses = [
      "scheduled",
      "waiting",
      "active",
      "ended",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (req.user.role !== "admin" && session.doctorId !== getUserIdentity(req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Read the allowed next statuses for the session's current state.
    const nextStatuses = allowedStatusTransitions[session.status] || [];

    // Block invalid jumps like ended -> active or cancelled -> scheduled.
    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change session status from ${session.status} to ${status}.`,
      });
    }

    session.status = status;

    // Save start time the first time the session becomes active.
    if (status === "active" && !session.startedAt) {
      session.startedAt = new Date();
    }

    // Save end time when the session is finished.
    if (status === "ended") {
      session.endedAt = new Date();
    }

    await session.save();

    return res.status(200).json({
      message: `Session status updated to ${status}.`,
      session: toSessionResponse(session),
    });
  } catch (error) {
    console.error("updateSessionStatus error:", error.message);

    return res.status(500).json({
      message: "Server error updating session status.",
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const { role } = req.user;
    const userId = getUserIdentity(req.user);

    if (role !== "admin" && role !== "doctor") {
      return res.status(403).json({ message: "Access denied." });
    }

    if (role === "doctor" && session.doctorId !== userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Past, ongoing, or already progressed sessions should not be removed.
    if (!isUpcomingSession(session)) {
      if (session.scheduledAt && new Date(session.scheduledAt) <= new Date()) {
        return res.status(400).json({
          message: "Past or ongoing sessions cannot be deleted.",
        });
      }

      return res.status(400).json({
        message: "Only upcoming sessions can be deleted.",
      });
    }

    await session.deleteOne();

    return res.status(200).json({
      message: "Upcoming telemedicine session deleted successfully.",
    });
  } catch (error) {
    console.error("deleteSession error:", error.message);

    return res.status(500).json({
      message: "Server error while deleting session.",
    });
  }
};

const syncAppointmentUpdate = async (req, res) => {
  try {
    const { appointmentId, appointmentDate, timeSlot, status } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "Appointment ID is required.",
      });
    }

    const session = await TelemedicineSession.findOne({ appointmentId });

    if (!session) {
      return res.status(404).json({
        message: "Session not found for appointment.",
      });
    }

    if (["ended", "cancelled"].includes(session.status)) {
      return res.status(400).json({
        message: `Cannot sync a session with status: ${session.status}.`,
      });
    }

    if (status === "cancelled") {
      session.status = "cancelled";
    } else if (status === "completed") {
      session.status = "ended";
      session.endedAt = session.endedAt || new Date();
    } else if (appointmentDate || timeSlot) {
      const scheduledAt = getAppointmentScheduledAt(
        {
          appointmentDate,
          timeSlot,
        },
        session.scheduledAt
      );

      if (!scheduledAt) {
        return res.status(400).json({
          message: "Appointment date or time slot is invalid for session sync.",
        });
      }

      session.scheduledAt = scheduledAt;
    }

    await session.save();

    return res.status(200).json({
      message: "Telemedicine session synced with appointment update.",
      session: toSessionResponse(session),
    });
  } catch (error) {
    console.error("syncAppointmentUpdate error:", error.message);

    return res.status(500).json({
      message: "Server error while syncing appointment update.",
    });
  }
};

export {
  createSession,
  createSessionFromAppointment,
  getAllSessions,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
  syncAppointmentUpdate,
};
