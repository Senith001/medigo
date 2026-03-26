import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime:   { type: String, required: true }, // e.g. "17:00"
  isAvailable: { type: Boolean, default: true },
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    // ── Auth fields ────────────────────────────────────────────
    authUserId: { type: String, default: null }, // link to auth-service user
    fullName:   { type: String, required: [true, 'Full name is required'], trim: true },
    email:      { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password:   { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    phone:      { type: String, required: [true, 'Phone is required'], trim: true },
    role:       { type: String, default: 'doctor' },

    // ── Professional details ───────────────────────────────────
    specialty:       { type: String, required: [true, 'Specialty is required'], trim: true },
    qualifications:  { type: String, trim: true },
    hospital:        { type: String, trim: true },
    experience:      { type: Number, default: 0 }, // years
    bio:             { type: String, trim: true, maxlength: 500 },
    languages:       [{ type: String }],
    profilePicture:  { type: String, default: null },

    // ── Consultation ───────────────────────────────────────────
    fee:              { type: Number, default: 0 },
    consultationType: {
      type: [String],
      enum: ['telemedicine', 'in-person'],
      default: ['telemedicine'],
    },

    // ── Availability ───────────────────────────────────────────
    availability: [availabilitySlotSchema],

    // ── Status ─────────────────────────────────────────────────
    isVerified:  { type: Boolean, default: false }, // admin verifies
    isActive:    { type: Boolean, default: true  },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ── Registration number ────────────────────────────────────
    slmcNumber: { type: String, trim: true }, // Sri Lanka Medical Council No.
  },
  { timestamps: true }
);

// Hash password before save
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

doctorSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

doctorSchema.index({ specialty: 1 });
doctorSchema.index({ hospital: 1 });
doctorSchema.index({ isVerified: 1, isActive: 1 });

export default mongoose.model('Doctor', doctorSchema);
