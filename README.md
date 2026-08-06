# Cloudinary Upload API

A high-performance Express backend for uploading, hosting, and managing **Images** and **Videos** using Cloudinary.

Supports streaming uploads directly from memory, dual Cloudinary accounts (separate accounts for Images & Videos), rate limiting, IP security, dynamic destination folders, and HTML web player test UIs.

---

## Features

- 📸 **Image Uploads**: Supports JPG, JPEG, PNG, WEBP, GIF (converts to optimized WEBP by default).
- 🎬 **Video Uploads**: Supports MP4, MOV, WEBM, AVI, MKV, OGG, 3GP, M4V.
- ⚡ **Zero Disk Storage**: Streams buffer uploads directly into Cloudinary memory storage.
- 🔐 **Dual Cloudinary Accounts**: Option to route image uploads to **Account 1** and video uploads to **Account 2**.
- 🛡️ **Security**: API key protection (`x-api-key`), rate limiting, IP blocker middleware, and Helmet headers.
- 📂 **Dynamic Folders**: Specify target folders dynamically via endpoint paths (e.g. `/api/avatars` or `/api/courses/2026`).

---

## Setup & Environment Variables

```bash
npm install
cp .env.example .env
```

Edit `.env` to configure your Cloudinary credentials and upload limits:

```env
# Account 1 - Images
CLOUDINARY_CLOUD_NAME=your_image_cloud_name
CLOUDINARY_API_KEY=your_image_api_key
CLOUDINARY_API_SECRET=your_image_api_secret

# Account 2 - Videos (Optional; falls back to Account 1 if empty)
CLOUDINARY_VIDEO_CLOUD_NAME=your_video_cloud_name
CLOUDINARY_VIDEO_API_KEY=your_video_api_key
CLOUDINARY_VIDEO_API_SECRET=your_video_api_secret

# Server Configuration
PORT=3000
API_KEY=your_secret_api_key

# Upload & Rate Limits
MAX_UPLOAD_BYTES=52428800 # 50MB max upload size
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_UPLOADS=100

# Secret Key to bypass rate limits and file size limits
API_BYPASS_KEY=youris-bypass-secret
```

---

## Run

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

The server runs on `http://localhost:3000` (or the port specified in `.env`).

---

## Testing Web UIs

- **`upload-test.html`**: General testing UI for image and video uploads.
- **`upload-video-test.html`**: Dedicated video testing UI with local video preview, progress indicator, and live Cloudinary video playback streaming.

---

## API Endpoints

### 1. Upload Image or Video

**`POST /api/:folder?`** (e.g. `/api/uploads` or `/api/videos`)

Header: `x-api-key: <your_api_key>`  
Form-Data fields accepted: `image`, `video`, or `file`.

**Upload Video Example:**

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "x-api-key: youris-api-key" \
  -F "video=@/path/to/sample.mp4"
```

**Video Response (`200 OK`):**

```json
{
  "publicId": "videos/sample_abcd123",
  "url": "https://res.cloudinary.com/cloud_name/video/upload/v1722850000/videos/sample_abcd123.mp4",
  "resourceType": "video",
  "width": 1920,
  "height": 1080,
  "duration": 15.4,
  "format": "mp4",
  "bytes": 12450800,
  "createdAt": "2026-08-05T10:00:00Z"
}
```

**Upload Image Example:**

```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "x-api-key: youris-api-key" \
  -F "image=@/path/to/photo.jpg"
```

**Image Response (`200 OK`):**

```json
{
  "publicId": "uploads/photo_xyz789",
  "url": "https://res.cloudinary.com/cloud_name/image/upload/v1722850000/uploads/photo_xyz789.webp",
  "resourceType": "image",
  "width": 1200,
  "height": 800,
  "duration": null,
  "format": "webp",
  "bytes": 245678,
  "createdAt": "2026-08-05T10:00:00Z"
}
```

---

### 2. Fetch Media Details

**`GET /api/images/*`** or **`GET /api/videos/*`**

```bash
# Fetch video metadata
curl -H "x-api-key: youris-api-key" http://localhost:3000/api/videos/videos/sample_abcd123

# Fetch image metadata
curl -H "x-api-key: youris-api-key" http://localhost:3000/api/images/uploads/my_photo
```

---

### 3. Delete Media

**`DELETE /api/images/*`** or **`DELETE /api/videos/*`**

```bash
curl -X DELETE -H "x-api-key: youris-api-key" http://localhost:3000/api/videos/videos/sample_abcd123
```

---

### 4. Health Check

**`GET /health`** (Unauthenticated)

```json
{ "status": "ok" }
```
