# Cloudinary Upload API

A minimal Express backend that lets users upload images and videos, storing them in Cloudinary.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and fill in your real Cloudinary credentials (found at
https://console.cloudinary.com/app/settings/api-keys):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
API_KEY=crypten-api-key
```

`.env` is already listed in `.gitignore` — never commit real credentials.

## Run

```bash
npm start
# or for auto-reload during development:
npm run dev
```

Server runs on `http://localhost:3000` by default (change with `PORT` in `.env`).

## Testing UI

- Open `upload-test.html` in your browser for image & video testing.
- Open `upload-video-test.html` in your browser for dedicated video upload and live video playback testing.

## Endpoints

### `POST /api/:folder?` (e.g. `/api/videos` or `/api/uploads`)

Upload an image or video. Send as `multipart/form-data` with field name `video`, `image`, or `file`. Requires `x-api-key` header.

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "x-api-key: crypten-api-key" \
  -F "video=@/path/to/sample.mp4"
```

Response:

```json
{
  "publicId": "videos/abcd1234",
  "url": "https://res.cloudinary.com/.../videos/abcd1234.mp4",
  "resourceType": "video",
  "width": 1920,
  "height": 1080,
  "duration": 12.4,
  "format": "mp4",
  "bytes": 5242880,
  "createdAt": "2026-08-05T09:50:00Z"
}
```

### `GET /api/images/*` or `GET /api/videos/*`

Fetch metadata for a previously uploaded image or video.

```bash
curl -H "x-api-key: crypten-api-key" http://localhost:3000/api/videos/videos/abcd1234
```

### `DELETE /api/images/*` or `DELETE /api/videos/*`

Delete an image or video from Cloudinary.

```bash
curl -X DELETE -H "x-api-key: crypten-api-key" http://localhost:3000/api/videos/videos/abcd1234
```

### `GET /health`

Basic health check.

## Notes

- Uploaded files are streamed straight to Cloudinary from memory — nothing is written to local disk on the server.
- Max upload size defaults to 100MB (`MAX_UPLOAD_BYTES` in `.env`).
- Accepts image formats (`jpg`, `jpeg`, `png`, `webp`, `gif`) and video formats (`mp4`, `mov`, `webm`, `avi`, `mkv`, `ogv`).
- Credentials are read from environment variables only.
