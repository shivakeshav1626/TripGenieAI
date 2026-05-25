import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.info(`Server running on port ${PORT} — mode=${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown on unhandled rejections and uncaught exceptions
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      // Optionally shutdown or notify monitoring here
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      // In production you might exit the process to allow a restart
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error?.message || error);
    process.exit(1);
  }
};

startServer();
