import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    service: "doctor-service",
    message: "Doctor Service API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor service is healthy"
  });
});

app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});