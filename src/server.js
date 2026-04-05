import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js"; // Note the .js extension!

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

if (!process.env.JWT_SECRET) {
  console.error(
    "❌ FATAL ERROR: JWT_SECRET is not defined in the environment variables.",
  );
  process.exit(1); // Exit the application immediately
}

if (!MONGO_URI) {
  console.error(
    "❌ FATAL ERROR: MONGODB_URI is not defined in the environment variables.",
  );
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    // Start the server only after DB connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  });
