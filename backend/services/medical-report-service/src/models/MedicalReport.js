import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    // ── Owner info ─────────────────────────────────────────────
    patientId:    { type: String, required: true, index: true },
    patientName:  { type: String, required: true },
    patientEmail: { type: String, required: true },

    // ── Report details ─────────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    reportType:  {
      type: String,
      enum: ['blood_test', 'x_ray', 'mri', 'ct_scan', 'ecg', 'urine_test', 'other'],
      default: 'other',
    },

    // ── File info ──────────────────────────────────────────────
    fileName:     { type: String, required: true },
    fileUrl:      { type: String, required: true }, // path or cloud URL
    fileSize:     { type: Number },                 // bytes
    mimeType:     { type: String },

    // ── Access control ─────────────────────────────────────────
    // Doctors who can access this report
    sharedWith: [{ type: String }], // array of doctorIds

    // ── Appointment link ───────────────────────────────────────
    appointmentId: { type: String, default: null },

    // ── Doctor notes ───────────────────────────────────────────
    doctorNotes: { type: String, default: null },
    reviewedBy:  { type: String, default: null }, // doctorId
    reviewedAt:  { type: Date,   default: null  },

    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor'],
      default: 'patient',
    },
  },
  { timestamps: true }
);

medicalReportSchema.index({ patientId: 1, createdAt: -1 });
medicalReportSchema.index({ appointmentId: 1 });

export default mongoose.model('MedicalReport', medicalReportSchema);
