import cors from "cors";
import express from "express";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Build allowed origins from env vars; include common localhost defaults and Vercel if set
const rawClientUrls = process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:4173,http://localhost:3000";
const allowedOrigins = rawClientUrls
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Vercel sets VERCEL_URL in its environment; allow it if present
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

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

// API routes (mounted FIRST so they are evaluated before catch-all routes)
app.use("/api/auth", authRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/uploads", uploadRoutes);

// Root endpoint - explicitly defined to match / exactly
app.get("/", (req, res) => {
  res.status(200).send("TripGenie AI Backend is running successfully");
});

// API health check endpoint - explicitly defined for /api/health
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API healthy"
  });
});

// Serve client if it exists (optional SPA support)
const clientBuildPath = path.resolve("../client/dist");
if (process.env.NODE_ENV === "production" || fs.existsSync(clientBuildPath)) {
  // Serve static client assets
  app.use(express.static(clientBuildPath, { index: false }));
  
  // SPA fallback: serve index.html for routes that aren't API or uploads
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    const indexPath = path.join(clientBuildPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        // If index.html doesn't exist, let it fall through to 404 handler
        next();
      }
    });
  });
}

// Global 404 handler (catches all unmatched routes)
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Centralized error handler — logs server-side and returns sanitized response in production
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log full error server-side for diagnostics
  console.error(`Error: ${message}`);
  if (error.stack && process.env.NODE_ENV !== "production") {
    console.error(error.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    // never expose stack in production
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
});

export default app;
