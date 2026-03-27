const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
