const cloudinary = require("../cloudinary");
const { getAccountConfig } = cloudinary;

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Destination folder path in Cloudinary
 * @param {string} resourceType - Resource type ("auto", "image", "video")
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = "", resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const accountConfig = getAccountConfig(resourceType);

    const options = {
      ...accountConfig,
      resource_type: resourceType,
    };

    if (resourceType === "image") {
      options.format = "webp";
      options.quality = "auto";
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
