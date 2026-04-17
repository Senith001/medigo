import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      trim: true
    },
    doctorId: {
      type: String,
      required: true,
      trim: true
    },
    appointmentId: {
      type: String,
      trim: true
    },
    reportTitle: {
      type: String,
      required: true,
      trim: true
    },
    reportType: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String,
      trim: true
    },
    uploadedBy: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    },
    uploadDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0]
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;