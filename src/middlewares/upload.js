const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, jpeg, png, webp, and gif images are allowed.'), false);
  }
};

const maxBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 5 * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxBytes
  },
  fileFilter
});

module.exports = upload;
