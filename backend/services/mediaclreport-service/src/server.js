import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5006;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Medical Report Service running on port ${PORT}`);
  });
};

start();
