import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MongoDB connection string is not set. Set MONGO_URI in environment.");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      autoIndex: false,
    });

    console.info(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);

    // Production should fail fast. For development we also exit to ensure the
    // developer notices and configures Atlas correctly. This keeps persistence
    // consistent and avoids accidental use of in-memory stores.
    process.exit(1);
  }
};

export default connectDB;
