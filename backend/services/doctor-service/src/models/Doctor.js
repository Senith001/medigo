import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    qualifications: {
      type: String,
      required: true
    },
    experienceYears: {
      type: Number,
      required: true
    },
    clinicLocation: {
      type: String,
      required: true
    },
    consultationFee: {
      type: Number,
      required: true
    },
    bio: {
      type: String
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;