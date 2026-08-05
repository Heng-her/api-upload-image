const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/x-matroska',
  'video/ogg',
  'video/3gpp',
  'video/x-m4v',
  'video/mpeg'
];

const allowedExtensions = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.mov', '.webm', '.avi', '.mkv', '.ogv', '.3gp', '.m4v', '.mpeg', '.mpg'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${mimeType}). Only image and video files are allowed.`), false);
  }
};

const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 100 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxBytes
  },
  fileFilter
});

module.exports = upload;
