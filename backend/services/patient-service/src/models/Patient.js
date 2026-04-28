import mongoose from "mongoose";
import Counter from "./Counter.js";

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true
    },
    authUserId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true,
      unique: true
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
      lowercase: true
    },
    phone: {
      type: String,
      default: ""
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: ""
    },
    dateOfBirth: {
      type: String,
      default: ""
    },
    bloodGroup: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    profilePicture: {
      type: String,
      default: "" 
    },
    emergencyContactName: {
      type: String,
      default: ""
    },
    emergencyContactPhone: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (this.isNew && !this.patientId) {
    const counter = await Counter.findOneAndUpdate(
      { key: "patient_profile" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.patientId = `PT${String(counter.seq).padStart(3, "0")}`;
  }

  next();
});

export default mongoose.model("Patient", patientSchema);