require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024; // 10MB default

app.use(cors());
app.use(express.json());

// Keep the file in memory only long enough to stream it to Cloudinary —
// nothing is written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'uploads', resource_type: 'image', ...options },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/upload — accepts multipart/form-data with field name "image"
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Use field name "image".' });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer);

    res.status(201).json({
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
    });
  } catch (err) {
    console.error('Upload failed:', err.message);
    res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
});

// GET /api/images/:publicId — fetch stored metadata for an uploaded image
// publicId may include folder segments, e.g. uploads/abc123
app.get('/api/images/*publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const result = await cloudinary.api.resource(publicId);

    res.json({
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
    });
  } catch (err) {
    if (err.http_code === 404) {
      return res.status(404).json({ error: 'Image not found' });
    }
    console.error('Fetch failed:', err.message);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// DELETE /api/images/:publicId — remove an image from Cloudinary
app.delete('/api/images/*publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(404).json({ error: 'Image not found', detail: result.result });
    }
    res.json({ deleted: publicId });
  } catch (err) {
    console.error('Delete failed:', err.message);
    res.status(500).json({ error: 'Delete failed', detail: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Multer / general error handler (e.g. file too large, wrong file type)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('image files')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(PORT, () => {
  console.log(`Cloudinary upload API listening on http://localhost:${PORT}`);
});
