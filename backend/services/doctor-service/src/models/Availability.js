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