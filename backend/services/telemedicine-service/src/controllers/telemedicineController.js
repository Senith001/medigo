const mongoose = require("mongoose");

const TelemedicineSession = require("../models/TelemedicineSession");
const generateRoomName = require("../utils/generateRoomName");
const { generateJitsiMeetingLink } = require("../services/jitsiService");

const canAccessSession = (session, user) => {
  return (
    user.role === "admin" ||
    session.patientId === user.userId ||
    session.doctorId === user.userId
  );
};

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

    if (
      !appointmentId ||
      !patientId ||
      !patientName ||
      !doctorId ||
      !doctorName
    ) {
      return res.status(400).json({
        message: "All required session fields must be provided.",
      });
    }

    const existingSession = await TelemedicineSession.findOne({ appointmentId });

    if (existingSession) {
      return res.status(200).json({
        message: "Session already exists for this appointment.",
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
      status: "scheduled",
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

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
      return res.status(404).json({
        message: "Session not found for appointment.",
      });
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (!canAccessSession(session, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

    const session = await TelemedicineSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    if (req.user.role !== "admin" && session.doctorId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    session.status = status;

    if (status === "active" && !session.startedAt) {
      session.startedAt = new Date();
    }

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

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

module.exports = {
  createSession,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
};
