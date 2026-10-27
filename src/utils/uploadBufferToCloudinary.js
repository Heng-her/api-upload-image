const path = require("path");
const cloudinary = require("../cloudinary");
const { getAccountConfig } = cloudinary;

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * Supports all file types: images, videos, audio, PDFs, and raw files (JSON, CSV, ZIP, etc.).
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Destination folder path in Cloudinary
 * @param {string} resourceType - Resource type ("auto", "image", "video", "raw")
 * @param {string} mimeType - File MIME type
 * @param {string} originalname - Original file name with extension
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = "", resourceType = "auto", mimeType = "", originalname = "") => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalname || "").toLowerCase();
    const mime = (mimeType || "").toLowerCase();

    const isVideo =
      resourceType === "video" ||
      mime.startsWith("video/") ||
      /\.(mp4|mov|webm|avi|mkv|ogv|3gp|m4v|mpeg|mpg|wmv|flv)$/i.test(ext);

    const isAudio =
      mime.startsWith("audio/") ||
      /\.(mp3|wav|ogg|aac|flac|m4a|wma)$/i.test(ext);

    const isPdf =
      mime === "application/pdf" ||
      mime === "application/x-pdf" ||
      ext === ".pdf";

    const isImage =
      (mime.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|svg|bmp|tiff|ico)$/i.test(ext)) &&
      !isPdf;

    // Determine Cloudinary resource_type and account
    let effectiveResourceType = resourceType;
    if (resourceType === "auto") {
      if (isVideo || isAudio) {
        effectiveResourceType = "video";
      } else if (isImage || isPdf) {
        effectiveResourceType = "image";
      } else {
        effectiveResourceType = "raw";
      }
    }

    const accountConfig = getAccountConfig(
      effectiveResourceType === "video" ? "video" : "image"
    );

    const options = {
      ...accountConfig,
      resource_type: effectiveResourceType,
    };

    if (effectiveResourceType === "image") {
      if (isPdf) {
        options.format = "pdf";
      } else if (ext !== ".svg" && !mime.includes("svg")) {
        options.format = "webp";
        options.quality = "auto";
      }
    } else if (effectiveResourceType === "raw") {
      options.use_filename = true;
      options.unique_filename = true;
    }

    if (folder && folder.trim() !== "") {
      options.folder = folder.trim();
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

module.exports = uploadBufferToCloudinary;
