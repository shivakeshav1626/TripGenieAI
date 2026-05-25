import cors from "cors";
import express from "express";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import ApiError from "./utils/ApiError.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:4173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, "Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TripGenie AI API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
});

export default app;
