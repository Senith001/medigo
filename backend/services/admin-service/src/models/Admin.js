import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    authUserId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["admin", "superadmin"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);