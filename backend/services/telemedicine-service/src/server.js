const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const telemedicineRoutes = require("./routes/telemedicineRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

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
