import TelemedicineSession from "../models/TelemedicineSession.js";
import generateRoomName from "../utils/generateRoomName.js";
import { generateJitsiMeetingLink } from "../services/jitsiService.js";

// Helper: keep track of valid state jumps to avoid logic errors.
const allowedStatusTransitions = {
  scheduled: ["waiting", "cancelled"],
  waiting: ["active", "cancelled"],
  active: ["ended"],
  ended: [],
  cancelled: [],
};

// Helper: only allow interaction if the session has not started its end-of-life status.
const isUpcomingSession = (session) => {
  return ["scheduled", "waiting"].includes(session.status);
};

// Helper: check record ownership based on ID and role.
const canAccessSession = (session, user) => {
  if (user.role === "admin") return true;
  return session.patientId === user.userId || session.doctorId === user.userId;
};

const createSession = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      scheduledAt,
    } = req.body;

    const existingSession = await TelemedicineSession.findOne({
      appointmentId,
    });

    if (existingSession) {
      return res.status(409).json({
        message: "A session already exists for this appointment.",
        session: existingSession,
      });
    }

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
      scheduledAt: scheduledAt || null,
    });

    return res.status(201).json({
      message: "Telemedicine session created successfully.",
      session,
    });
  } catch (error) {
    console.error("createSession error:", error.message);

    return res.status(500).json({
      message: "Server error while creating telemedicine session.",
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

    return res.status(200).json(session);
  } catch (error) {
    console.error("getSessionById error:", error.message);

    return res.status(500).json({ message: "Server error fetching session." });
  }
};

const getSessionByAppointmentId = async (req, res) => {
  try {
    const session = await TelemedicineSession.findOne({
      appointmentId: req.params.appointmentId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "No session found for this appointment." });
    }

    if (!canAccessSession(session, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json(session);
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
      session,
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

    if (req.user.role !== "admin" && session.doctorId !== req.user.userId) {
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
      session,
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

    if (req.user.role !== "admin" && session.doctorId !== req.user.userId) {
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
      session,
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

    const { role, userId } = req.user;

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

export {
  createSession,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
};
