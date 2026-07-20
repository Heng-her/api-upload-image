# api-upload-image
# Cloudinary Upload API

A minimal Express backend that lets users upload images and stores them in Cloudinary.

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
```

`.env` is already listed in `.gitignore` — never commit real credentials.

## Run

```bash
npm start
```

Server runs on `http://localhost:3000` by default (change with `PORT` in `.env`).

## Endpoints

### `POST /api/upload`
Upload an image. Send as `multipart/form-data` with field name `image`.

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@/path/to/photo.jpg"
```

Response:
```json
{
  "publicId": "uploads/abcd1234",
  "url": "https://res.cloudinary.com/.../uploads/abcd1234.jpg",
  "width": 1200,
  "height": 800,
  "format": "jpg",
  "bytes": 245678,
  "createdAt": "2026-07-16T10:00:00Z"
}
```

### `GET /api/images/:publicId`
Fetch metadata for a previously uploaded image.

```bash
curl http://localhost:3000/api/images/uploads/abcd1234
```

### `DELETE /api/images/:publicId`
Delete an image from Cloudinary.

```bash
curl -X DELETE http://localhost:3000/api/images/uploads/abcd1234
```

### `GET /health`
Basic health check.

## Notes

- Uploaded files are streamed straight to Cloudinary from memory — nothing is
  written to local disk on the server.
- Max upload size defaults to 10MB (`MAX_UPLOAD_BYTES` in `.env`).
- Only image MIME types are accepted; other files are rejected with a 400.
- Credentials are read from environment variables only — never hardcode them
  in source files.
