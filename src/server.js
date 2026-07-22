const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
require("dotenv").config();

const apiKeyMiddleware = require("./middlewares/apiKey");
const { ipBlocker } = require("./middlewares/ipBlocker");
const uploadRateLimiter = require("./middlewares/rateLimiter");
const uploadRoutes = require("./routes/upload");
const uploadController = require("./controllers/uploadController");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy (1 hop) required for reverse proxies / rate limiting behind proxies (e.g., Render, Heroku)
app.set("trust proxy", 1);

// Hide x-powered-by header
app.disable("x-powered-by");

// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Endpoint (Unauthenticated & Unrestricted)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Apply IP blocking check for protected API routes
app.use("/api", ipBlocker);

// Apply API Key authentication for protected API routes
app.use("/api", apiKeyMiddleware);

// GET Image Details with nested folder support: GET /api/images/*
app.get("/api/images/*", uploadController.getImageDetails);

// DELETE Image with nested folder support: DELETE /api/images/*
app.delete("/api/images/*", uploadController.deleteImage);

// Upload endpoint with rate limiting: POST /api/* (e.g. /api/upload, /api/avatar, /api/blog/2026/july)
app.use("/api", uploadRateLimiter, uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size limit exceeded. Maximum allowed size is 5MB.",
      });
    }
    return res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
  }

  if (err && err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err && err.http_code) {
    return res.status(err.http_code).json({
      error: err.message || "Cloudinary operational error.",
    });
  }

  console.error("Unhandled Error:", err);
  return res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
