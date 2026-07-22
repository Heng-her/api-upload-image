const cloudinary = require('../cloudinary');

/**
 * Uploads a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Destination folder path in Cloudinary
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer, folder = '') => {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: 'image'
    };

    if (folder && folder.trim() !== '') {
      options.folder = folder.trim();
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = uploadBufferToCloudinary;
