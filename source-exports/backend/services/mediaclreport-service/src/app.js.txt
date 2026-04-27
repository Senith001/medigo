import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Medical Report Service API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "medicalreport-service",
    message: "Medical report service is healthy"
  });
});

export default app;