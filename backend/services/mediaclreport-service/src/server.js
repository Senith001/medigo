import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5006;

connectDB();

app.listen(PORT, () => {
  console.log(`Medical Report Service running on port ${PORT}`);
});