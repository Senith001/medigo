import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from "path";
import connectDB from "./config/db.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Serve uploaded payment slip files.
app.use("/uploads", express.static(join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    service: "payment-service",
    status: "running",
    port: process.env.PORT || 5007,
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Payment service is healthy",
  });
});

app.use("/api/payments", paymentRoutes);

// Error handlers must come after routes.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
