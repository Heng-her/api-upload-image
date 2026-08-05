const { v2: cloudinary } = require('cloudinary');

const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    `Copy .env.example to .env and fill in your Cloudinary credentials.`
  );
}

// Account 1 (Image Account) Config
const imageAccountConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

// Account 2 (Video Account) Config - Falls back to Account 1 if not provided
const videoAccountConfig = {
  cloud_name: process.env.CLOUDINARY_VIDEO_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_VIDEO_API_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_VIDEO_API_SECRET || process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

// Default config for global instance (Account 1)
cloudinary.config(imageAccountConfig);

const getAccountConfig = (resourceType = 'image') => {
  return resourceType === 'video' ? videoAccountConfig : imageAccountConfig;
};

module.exports = cloudinary;
module.exports.cloudinary = cloudinary;
module.exports.imageAccountConfig = imageAccountConfig;
module.exports.videoAccountConfig = videoAccountConfig;
module.exports.getAccountConfig = getAccountConfig;
