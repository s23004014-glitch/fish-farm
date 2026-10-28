import mongoose from "mongoose";

// Connect to MongoDB using the address from .env
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Only log the host name, never the full address (it can contain a password)
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); 
    // stop the app if the database is not available
  }
};

export default connectDB;