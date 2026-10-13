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
  'video/mpeg',
  'application/pdf',
  'application/x-pdf'
];

const allowedExtensions = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.mov', '.webm', '.avi', '.mkv', '.ogv', '.3gp', '.m4v', '.mpeg', '.mpg',
  '.pdf'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${mimeType}). Only image, video, and PDF files are allowed.`), false);
  }
};

const defaultMaxBytes = parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 50 * 1024 * 1024;
const bypassMaxBytes = 2 * 1024 * 1024 * 1024; // 2 GB physical limit for bypass

const defaultUpload = multer({
  storage,
  limits: { fileSize: defaultMaxBytes },
  fileFilter
});

const bypassUpload = multer({
  storage,
  limits: { fileSize: bypassMaxBytes },
  fileFilter
});

const dynamicUploadFieldsMiddleware = (fields) => {
  const defaultFieldsHandler = defaultUpload.fields(fields);
  const bypassFieldsHandler = bypassUpload.fields(fields);

  return (req, res, next) => {
    const bypassHeader = req.headers["x-api-bypass"];
    const secretBypass = process.env.API_BYPASS_KEY || "crypten-bypass-secret";
    if (bypassHeader && bypassHeader === secretBypass) {
      return bypassFieldsHandler(req, res, next);
    }
    return defaultFieldsHandler(req, res, next);
  };
};

module.exports = defaultUpload;
module.exports.dynamicUploadFieldsMiddleware = dynamicUploadFieldsMiddleware;
