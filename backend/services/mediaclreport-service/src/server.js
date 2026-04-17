import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs";

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Medical Report DB connected");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};
connectDB();

// --- Storage Config ---
const uploadDir = 'uploads/reports';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// --- Model ---
const reportSchema = new mongoose.Schema({
  patientId:   { type: String, required: true },
  patientName: { type: String },
  doctorId:    { type: String },
  doctorName:  { type: String },
  reportTitle: { type: String, required: true },
  reportType:  { type: String },
  description: { type: String },
  fileUrl:     { type: String, required: true },
  uploadedBy:  { type: String, default: 'patient' },
  status:      { type: String, default: 'ready' },
}, { timestamps: true });
const Report = mongoose.model("Report", reportSchema);

// --- Routes ---

// Health Check
app.get("/", (req, res) => res.json({ success: true, message: "Medical Report Service Running" }));

// Upload Report
app.post("/api/reports", upload.single("reportFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const { patientId, doctorId, reportTitle, reportType, description, uploadedBy } = req.body;

    if (!patientId || !reportTitle) {
      return res.status(400).json({ success: false, message: "patientId and reportTitle are required" });
    }

    const newReport = await Report.create({
      patientId,
      doctorId,
      reportTitle,
      reportType,
      description,
      uploadedBy: uploadedBy || 'patient',
      fileUrl: `/uploads/reports/${req.file.filename}`
    });

    res.status(201).json({ success: true, data: newReport });
  } catch (err) {
    console.error('Report upload error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Reports by Patient
app.get("/api/reports/patient/:patientId", async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.params.patientId }).sort("-createdAt");
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Reports by Doctor
app.get("/api/reports/doctor/:doctorId", async (req, res) => {
  try {
    const reports = await Report.find({ doctorId: req.params.doctorId }).sort("-createdAt");
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Medical Report Service running on port ${PORT}`));
