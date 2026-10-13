const cloudinary = require("../cloudinary");
const { getAccountConfig } = cloudinary;

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Destination folder path in Cloudinary
 * @param {string} resourceType - Resource type ("auto", "image", "video")
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = "", resourceType = "auto", mimeType = "", originalname = "") => {
  return new Promise((resolve, reject) => {
    const isVideo = resourceType === "video" || (mimeType && mimeType.startsWith("video/"));
    const isPdf =
      mimeType === "application/pdf" ||
      mimeType === "application/x-pdf" ||
      (originalname && originalname.toLowerCase().endsWith(".pdf"));

    const accountConfig = getAccountConfig(isVideo ? "video" : "image");
    const effectiveResourceType = isVideo ? "video" : resourceType;

    const options = {
      ...accountConfig,
      resource_type: effectiveResourceType,
    };

    if (effectiveResourceType === "image" && !isPdf) {
      options.format = "webp";
      options.quality = "auto";
    }

    if (isPdf) {
      options.format = "pdf";
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
