const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const sanitizeFolder = require("../middlewares/sanitizeFolder");
const uploadController = require("../controllers/uploadController");

const { dynamicUploadMiddleware, dynamicUploadFieldsMiddleware } = upload;

const uploadMiddleware = dynamicUploadMiddleware
  ? dynamicUploadMiddleware()
  : dynamicUploadFieldsMiddleware([
      { name: "file", maxCount: 1 },
      { name: "image", maxCount: 1 },
      { name: "video", maxCount: 1 },
      { name: "pdf", maxCount: 1 },
      { name: "document", maxCount: 1 },
      { name: "raw", maxCount: 1 },
      { name: "json", maxCount: 1 },
    ]);

// Dedicated endpoints: POST /upload/file or POST /api/upload/file
router.post(
  "/file",
  sanitizeFolder,
  uploadMiddleware,
  uploadController.uploadImage,
);

router.post(
  "/upload/file",
  sanitizeFolder,
  uploadMiddleware,
  uploadController.uploadImage,
);

// Handles root uploads: POST /api or POST /upload
router.post(
  "/",
  sanitizeFolder,
  uploadMiddleware,
  uploadController.uploadImage,
);

// Handles dynamic folder uploads: POST /api/* or POST /upload/*
router.post(
  "/*",
  sanitizeFolder,
  uploadMiddleware,
  uploadController.uploadImage,
);

module.exports = router;
