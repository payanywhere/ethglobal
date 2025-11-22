import mongoose from "mongoose"
import { config } from "../../config/env"

export async function connectDB(): Promise<void> {
  const mongoUri = config.mongoUri

  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI not defined. Starting without database connection.")
    return
  }

  try {
    console.log("🔌 Attempting MongoDB connection...")
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000
    })
    console.log("✅ MongoDB connected successfully")
  } catch (err) {
    console.warn("⚠️ MongoDB connection failed. Continuing without database.")
    if (err instanceof Error) console.warn(`Reason: ${err.message}`)
  }
}
