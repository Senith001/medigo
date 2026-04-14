import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    patientId: {
      type: String,
      required: true,
      trim: true
    },
    appointmentId: {
      type: String,
      trim: true
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true
    },
    medicines: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        dosage: {
          type: String,
          required: true,
          trim: true
        },
        duration: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    notes: {
      type: String,
      trim: true
    },
    issuedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0]
    }
  },
  {
    timestamps: true
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;