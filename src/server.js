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

// Apply IP blocking check for protected API and upload routes
app.use("/api", ipBlocker);
app.use("/upload", ipBlocker);

// Apply API Key authentication for protected API and upload routes
app.use("/api", apiKeyMiddleware);
app.use("/upload", apiKeyMiddleware);

// GET Image, Video & File Details with nested folder support
app.get("/api/images/*", uploadController.getImageDetails);
app.get("/api/videos/*", uploadController.getVideoDetails);
app.get("/api/files/*", uploadController.getFileDetails);
app.get("/api/raw/*", uploadController.getRawDetails);
app.get("/upload/files/*", uploadController.getFileDetails);
app.get("/upload/raw/*", uploadController.getRawDetails);

// DELETE Image, Video & File with nested folder support
app.delete("/api/images/*", uploadController.deleteImage);
app.delete("/api/videos/*", uploadController.deleteVideo);
app.delete("/api/files/*", uploadController.deleteFile);
app.delete("/api/raw/*", uploadController.deleteRaw);
app.delete("/upload/files/*", uploadController.deleteFile);
app.delete("/upload/raw/*", uploadController.deleteRaw);

// Upload endpoints with rate limiting: POST /upload/file, POST /api/upload/file, POST /api/*
app.use("/api", uploadRateLimiter, uploadRoutes);
app.use("/upload", uploadRateLimiter, uploadRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Math.round((parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 100 * 1024 * 1024) / (1024 * 1024));
      return res.status(400).json({
        error: `File size limit exceeded. Maximum allowed size is ${maxMb}MB.`,
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
