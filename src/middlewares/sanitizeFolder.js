const path = require('path');

const sanitizeFolder = (req, res, next) => {
  let rawFolder = req.params[0] || req.params.folder || '';

  // Remove leading and trailing slashes
  rawFolder = rawFolder.replace(/^\/+|\/+$/g, '');

  if (!rawFolder) {
    req.sanitizedFolder = '';
    return next();
  }

  // Prevent path traversal
  if (rawFolder.includes('..')) {
    return res.status(400).json({
      error: 'Invalid folder path: Path traversal detected.'
    });
  }

  // Validate allowed characters: a-z, A-Z, 0-9, -, _, /
  const folderRegex = /^[a-zA-Z0-9/_-]+$/;
  if (!folderRegex.test(rawFolder)) {
    return res.status(400).json({
      error: 'Invalid folder path: Contains forbidden characters.'
    });
  }

  // Normalize multiple slashes into single slashes
  const sanitized = rawFolder.split('/').filter(Boolean).join('/');

  req.sanitizedFolder = sanitized;
  next();
};

module.exports = sanitizeFolder;
