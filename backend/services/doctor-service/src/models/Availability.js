import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    day: {
      type: String,
      required: true
    },
    date: {
      type: String
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    hospital: {
      type: String
    },
    location: {
      type: String
    },
    fee: {
      type: Number
    },
    bookedCount: {
      type: Number,
      default: 0
    },
    maxPatients: {
      type: Number,
      default: 10
    },
    patientInterval: {
      type: Number,
      default: 30 // minutes per patient
    },
    consultationType: {
      type: String,
      enum: ['telemedicine', 'in-person'],
      default: 'in-person'
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;