const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: null, // Link to Availability/Session
    },
    patientId: {
      type: String,
      required: [true, 'Patient ID is required'],
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
    },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
    },
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
    },
    doctorEmail: {
      type: String,
      required: [true, 'Doctor email is required'],
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
    },
    
    hospital: {
      type: String,
      default: null,
    },
  
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    type: {
      type: String,
      enum: ['in-person', 'telemedicine'],
      default: 'telemedicine',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    reason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin', null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    fee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'processing', 'paid', 'refunded'],
      default: 'unpaid',
    },
    meetingLink: {
      type: String,
      default: null,
    },
    // Snapshotted at booking time so display never needs a cross-service call
    patientNumber: {
      type: Number,
      default: null,
    },
    maxPatients: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index(
  { appointmentDate: 1, doctorId: 1, timeSlot: 1, patientId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);