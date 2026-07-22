const cloudinary = require('../cloudinary');
const uploadBufferToCloudinary = require('../utils/uploadBufferToCloudinary');

const uploadImage = async (req, res, next) => {
  try {
    const file = req.file || (req.files && (req.files.image?.[0] || req.files.file?.[0]));
    if (!file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const folder = req.sanitizedFolder || '';
    const result = await uploadBufferToCloudinary(file.buffer, folder);

    return res.status(200).json({
      publicId: result.public_id,
      url: result.secure_url || result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at
    });
  } catch (error) {
    next(error);
  }
};

const getImageDetails = async (req, res, next) => {
  try {
    const rawPublicId = req.params[0] || req.params.publicId;

    if (!rawPublicId) {
      return res.status(400).json({ error: 'Public ID is required.' });
    }

    const cleanPublicId = rawPublicId.replace(/^\/+|\/+$/g, '');

    const result = await cloudinary.api.resource(cleanPublicId, {
      resource_type: 'image'
    });

    return res.status(200).json({
      publicId: result.public_id,
      url: result.secure_url || result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at
    });
  } catch (error) {
    if (error && error.http_code === 404) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const rawPublicId = req.params[0] || req.params.publicId;

    if (!rawPublicId) {
      return res.status(400).json({ error: 'Public ID is required.' });
    }

    const cleanPublicId = rawPublicId.replace(/^\/+|\/+$/g, '');

    const result = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: 'image',
      invalidate: true
    });

    if (result.result === 'not_found') {
      return res.status(404).json({ error: 'Image not found.' });
    }

    return res.status(200).json({
      message: 'Image deleted successfully.',
      publicId: cleanPublicId,
      result: result.result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  getImageDetails,
  deleteImage
};
