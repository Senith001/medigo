import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  dosage:    { type: String, required: true, trim: true }, // e.g. "500mg"
  frequency: { type: String, required: true, trim: true }, // e.g. "3 times a day"
  duration:  { type: String, required: true, trim: true }, // e.g. "7 days"
  notes:     { type: String, trim: true },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, index: true },
    patientId:     { type: String, required: true, index: true },
    patientName:   { type: String, required: true },
    patientEmail:  { type: String, required: true },
    doctorId:      { type: String, required: true, index: true },
    doctorName:    { type: String, required: true },
    doctorEmail:   { type: String, required: true },
    specialty:     { type: String },

    diagnosis:     { type: String, required: true, trim: true },
    medicines:     [medicineSchema],
    instructions:  { type: String, trim: true }, // general advice
    followUpDate:  { type: Date, default: null },

    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 }, { unique: true });

export default mongoose.model('Prescription', prescriptionSchema);
