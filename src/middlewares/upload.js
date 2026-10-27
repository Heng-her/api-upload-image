const multer = require('multer');

const storage = multer.memoryStorage();

// File filter: Accepts all file types (images, videos, audio, PDFs, JSON, documents, archives, etc.)
const fileFilter = (req, file, cb) => {
  cb(null, true);
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

// Middleware accepting any file field name
const dynamicUploadMiddleware = () => {
  const defaultAnyHandler = defaultUpload.any();
  const bypassAnyHandler = bypassUpload.any();

  return (req, res, next) => {
    const bypassHeader = req.headers["x-api-bypass"];
    const secretBypass = process.env.API_BYPASS_KEY || "crypten-bypass-secret";
    if (bypassHeader && bypassHeader === secretBypass) {
      return bypassAnyHandler(req, res, next);
    }
    return defaultAnyHandler(req, res, next);
  };
};

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
module.exports.dynamicUploadMiddleware = dynamicUploadMiddleware;
module.exports.dynamicUploadFieldsMiddleware = dynamicUploadFieldsMiddleware;

