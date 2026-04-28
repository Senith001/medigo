import express from "express";
import cors from "cors";
import morgan from "morgan";
import doctorRoutes from "./routes/doctorRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);

app.use("/api/doctors/:doctorId/availability", (req, res, next) => {
  req.body.doctorId = req.params.doctorId;
  next();
}, availabilityRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Doctor Service API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "doctor-service",
    message: "Doctor service is healthy"
  });
});

export default app;