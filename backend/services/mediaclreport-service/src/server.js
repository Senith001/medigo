import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.json({
    service: "medicalreport-service",
    message: "Medical Report Service API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Medical report service is healthy"
  });
});

app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Medical Report Service running on port ${PORT}`);
});