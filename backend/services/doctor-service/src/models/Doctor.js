import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    authUserId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      unique: true,
      sparse: true
    },
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
    category: {
      type: String,
      required: true
    },
    nicNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    medicalLicenseNumber: {
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
    },
    offersTelemedicine: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;