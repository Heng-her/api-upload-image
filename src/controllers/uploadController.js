const path = require('path');
const cloudinary = require('../cloudinary');
const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');

const getUploadedFile = (req) => {
  if (req.file) return req.file;
  if (!req.files) return null;
  if (Array.isArray(req.files)) {
    return req.files[0] || null;
  }
  return (
    req.files.file?.[0] ||
    req.files.image?.[0] ||
    req.files.video?.[0] ||
    req.files.pdf?.[0] ||
    req.files.document?.[0] ||
    req.files.raw?.[0] ||
    req.files.json?.[0] ||
    Object.values(req.files).flat()[0] ||
    null
  );
};

const uploadMedia = async (req, res, next) => {
  try {
    const file = getUploadedFile(req);
    if (!file) {
      return res.status(400).json({ error: 'No file provided for upload.' });
    }

    const folder = req.sanitizedFolder || '';
    const isVideo =
      (file.mimetype && file.mimetype.startsWith('video/')) ||
      (req.files && !Array.isArray(req.files) && !!req.files.video?.[0]) ||
      req.path.includes('/videos');
    const resourceType = isVideo ? 'video' : 'auto';
    const result = await uploadBufferToCloudinary(file.buffer, folder, resourceType, file.mimetype, file.originalname);

    const extFromPublicId = result.public_id ? path.extname(result.public_id).replace(/^\./, '') : '';
    const extFromOriginal = file.originalname ? path.extname(file.originalname).replace(/^\./, '') : '';
    const detectedFormat = result.format || extFromPublicId || extFromOriginal || null;

    return res.status(200).json({
      publicId: result.public_id,
      url: result.secure_url || result.url,
      resourceType: result.resource_type,
      width: result.width || null,
      height: result.height || null,
      pages: result.pages || null,
      duration: result.duration || null,
      format: detectedFormat,
      bytes: result.bytes,
      createdAt: result.created_at
    });
  } catch (error) {
    next(error);
  }
};

const fetchResourceDetails = async (req, res, next, defaultResourceType = 'image') => {
  try {
    const rawPublicId = req.params[0] || req.params.publicId;

    if (!rawPublicId) {
      return res.status(400).json({ error: 'Public ID is required.' });
    }

    const cleanPublicId = rawPublicId.replace(/^\/+|\/+$/g, '');
    let resourceType = req.query.resource_type || defaultResourceType;

    if (!req.query.resource_type) {
      const ext = path.extname(cleanPublicId).toLowerCase();
      if (['.json', '.txt', '.csv', '.zip', '.tar', '.gz', '.doc', '.docx', '.xls', '.xlsx', '.xml'].includes(ext)) {
        resourceType = 'raw';
      } else if (['.mp4', '.mov', '.webm', '.avi', '.mkv', '.mp3', '.wav'].includes(ext)) {
        resourceType = 'video';
      }
    }

    const accountConfig = cloudinary.getAccountConfig ? cloudinary.getAccountConfig(resourceType) : {};

    let result;
    try {
      result = await cloudinary.api.resource(cleanPublicId, {
        ...accountConfig,
        resource_type: resourceType
      });
    } catch (err) {
      if (err && err.http_code === 404 && !req.query.resource_type) {
        // Fallback sequence: image -> video -> raw
        const fallbackTypes = ['image', 'video', 'raw'].filter((t) => t !== resourceType);
        let found = false;

        for (const fbType of fallbackTypes) {
          try {
            const fbConfig = cloudinary.getAccountConfig ? cloudinary.getAccountConfig(fbType) : {};
            result = await cloudinary.api.resource(cleanPublicId, {
              ...fbConfig,
              resource_type: fbType
            });
            found = true;
            break;
          } catch (fbErr) {
            if (!fbErr || fbErr.http_code !== 404) {
              throw fbErr;
            }
          }
        }

        if (!found) {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const extFromPublicId = result.public_id ? path.extname(result.public_id).replace(/^\./, '') : '';
    const detectedFormat = result.format || extFromPublicId || null;

    return res.status(200).json({
      publicId: result.public_id,
      url: result.secure_url || result.url,
      resourceType: result.resource_type,
      width: result.width || null,
      height: result.height || null,
      pages: result.pages || null,
      duration: result.duration || null,
      format: detectedFormat,
      bytes: result.bytes,
      createdAt: result.created_at
    });
  } catch (error) {
    if (error && error.http_code === 404) {
      return res.status(404).json({ error: 'Media resource not found.' });
    }
    next(error);
  }
};

const getImageDetails = (req, res, next) => fetchResourceDetails(req, res, next, 'image');
const getVideoDetails = (req, res, next) => fetchResourceDetails(req, res, next, 'video');
const getFileDetails = (req, res, next) => fetchResourceDetails(req, res, next, 'raw');
const getRawDetails = (req, res, next) => fetchResourceDetails(req, res, next, 'raw');

const deleteResource = async (req, res, next, defaultResourceType = 'image') => {
  try {
    const rawPublicId = req.params[0] || req.params.publicId;

    if (!rawPublicId) {
      return res.status(400).json({ error: 'Public ID is required.' });
    }

    const cleanPublicId = rawPublicId.replace(/^\/+|\/+$/g, '');
    let resourceType = req.query.resource_type || defaultResourceType;

    if (!req.query.resource_type) {
      const ext = path.extname(cleanPublicId).toLowerCase();
      if (['.json', '.txt', '.csv', '.zip', '.tar', '.gz', '.doc', '.docx', '.xls', '.xlsx', '.xml'].includes(ext)) {
        resourceType = 'raw';
      } else if (['.mp4', '.mov', '.webm', '.avi', '.mkv', '.mp3', '.wav'].includes(ext)) {
        resourceType = 'video';
      }
    }

    const accountConfig = cloudinary.getAccountConfig ? cloudinary.getAccountConfig(resourceType) : {};

    let result = await cloudinary.uploader.destroy(cleanPublicId, {
      ...accountConfig,
      resource_type: resourceType,
      invalidate: true
    });

    if (result.result === 'not_found' && !req.query.resource_type) {
      // Fallback sequence: image -> video -> raw
      const fallbackTypes = ['image', 'video', 'raw'].filter((t) => t !== resourceType);
      for (const fbType of fallbackTypes) {
        const fbConfig = cloudinary.getAccountConfig ? cloudinary.getAccountConfig(fbType) : {};
        result = await cloudinary.uploader.destroy(cleanPublicId, {
          ...fbConfig,
          resource_type: fbType,
          invalidate: true
        });
        if (result.result !== 'not_found') {
          break;
        }
      }
    }

    if (result.result === 'not_found') {
      return res.status(404).json({ error: 'Media resource not found.' });
    }

    return res.status(200).json({
      message: 'Media resource deleted successfully.',
      publicId: cleanPublicId,
      result: result.result
    });
  } catch (error) {
    next(error);
  }
};

const deleteImage = (req, res, next) => deleteResource(req, res, next, 'image');
const deleteVideo = (req, res, next) => deleteResource(req, res, next, 'video');
const deleteFile = (req, res, next) => deleteResource(req, res, next, 'raw');
const deleteRaw = (req, res, next) => deleteResource(req, res, next, 'raw');

module.exports = {
  uploadImage: uploadMedia,
  uploadMedia,
  getImageDetails,
  getVideoDetails,
  getFileDetails,
  getRawDetails,
  deleteImage,
  deleteVideo,
  deleteFile,
  deleteRaw
};
