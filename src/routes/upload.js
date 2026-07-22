const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const sanitizeFolder = require("../middlewares/sanitizeFolder");
const uploadController = require("../controllers/uploadController");

const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Handles dynamic folder uploads: POST /api/* or POST /api
router.post(
  "/*",
  sanitizeFolder,
  uploadMiddleware,
  uploadController.uploadImage,
);

module.exports = router;
