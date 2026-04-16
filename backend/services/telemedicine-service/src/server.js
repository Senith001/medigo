import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import telemedicineRoutes from "./routes/telemedicineRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    service: "telemedicine-service",
    status: "running",
    port: process.env.PORT || 5008,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Telemedicine service is healthy",
  });
});

app.use("/api/telemedicine", telemedicineRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`Telemedicine service running on port ${PORT}`);
});
