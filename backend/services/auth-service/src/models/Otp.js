import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    purpose: {
      type: String,
      enum: ["VERIFY_EMAIL", "RESET_PASSWORD"],
      required: true
    },
    otpCode: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    usedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// --- HASHING LOGIC ---
// Hash OTP before saving to the database
otpSchema.pre("save", async function (next) {
  if (!this.isModified("otpCode")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.otpCode = await bcrypt.hash(this.otpCode, salt);
  next();
});

// Method to compare plain OTP with hashed OTP----------------
otpSchema.methods.compareOtp = async function (enteredOtp) {
  return bcrypt.compare(enteredOtp, this.otpCode);
};
// -----------------------------------------------------------

export default mongoose.model("Otp", otpSchema);