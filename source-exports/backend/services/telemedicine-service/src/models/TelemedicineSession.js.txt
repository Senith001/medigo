import mongoose from "mongoose";

const telemedicineSessionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      index: true,
      unique: true,
      trim: true,
    },
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      index: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    meetingLink: {
      type: String,
      required: [true, "Meeting link is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "waiting", "active", "ended", "cancelled"],
      default: "scheduled",
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    // Persist appointment values locally so join-window checks do not depend on appointment-service.
    appointmentDate: {
      type: Date,
      default: null,
    },
    timeSlot: {
      type: String,
      default: null,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

telemedicineSessionSchema.index({ doctorId: 1, createdAt: -1 });
telemedicineSessionSchema.index({ patientId: 1, createdAt: -1 });

export default mongoose.model("TelemedicineSession", telemedicineSessionSchema);
