import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
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
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 6
    },
    phone: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "superadmin"], // Added "doctor"
      default: "patient"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    activationToken: {
      type: String,
      default: null
    },
    activationTokenExpires: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isNew && !this.userId) {
    let counterKey = "patient";
    let prefix = "P";

    if (this.role === "admin") {
      counterKey = "admin";
      prefix = "A";
    }

    if (this.role === "superadmin") {
      counterKey = "superadmin";
      prefix = "S";
    }

    if (this.role === "doctor") {
      counterKey = "doctor";
      prefix = "D";
    }

    const counter = await Counter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.userId = `${prefix}${String(counter.seq).padStart(3, "0")}`;
  }

  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);