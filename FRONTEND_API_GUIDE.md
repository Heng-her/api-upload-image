# 🚀 Frontend Developer API Guide

This guide details how to integrate the **Cloudinary Upload API** into your frontend application (React, Next.js, Vue, Mobile, or Vanilla JavaScript).

---

## 🔑 Authentication & Headers

All protected endpoints require an API Key header:

```http
x-api-key: youris-api-key
```

### ⚡ Admin / Unlimited Upload Bypass Header (Optional)

To bypass the **50MB size limit** (upload up to 2GB) and **rate limiting**, pass the secret bypass header:

```http
x-api-bypass: youris-bypass-secret
```

- **Base URL (Local)**: `http://localhost:3000` (or `http://localhost:3001`)
- **Base URL (Production)**: `https://api-upload-image-8ym9.onrender.com`

---

## 📌 Quick Endpoint Reference

| Action                 | HTTP Method | Endpoint                | Form-Data Key               | Description                                                                          |
| :--------------------- | :---------- | :---------------------- | :-------------------------- | :----------------------------------------------------------------------------------- |
| **Upload Image/Video** | `POST`      | `/api/:folder?`         | `image`, `video`, or `file` | Uploads media to Cloudinary in target folder (e.g. `/api/avatars` or `/api/videos`). |
| **Get Image Details**  | `GET`       | `/api/images/:publicId` | -                           | Returns metadata for an uploaded image.                                              |
| **Get Video Details**  | `GET`       | `/api/videos/:publicId` | -                           | Returns metadata for an uploaded video.                                              |
| **Delete Image**       | `DELETE`    | `/api/images/:publicId` | -                           | Deletes an image from Cloudinary.                                                    |
| **Delete Video**       | `DELETE`    | `/api/videos/:publicId` | -                           | Deletes a video from Cloudinary.                                                     |
| **Health Check**       | `GET`       | `/health`               | -                           | Server status check (no API key needed).                                             |

---

## 💻 Code Examples

### 1. Upload Video or Image (JavaScript `fetch`)

```javascript
async function uploadMedia(file, folder = "uploads") {
  const isVideo = file.type.startsWith("video/");
  const fieldName = isVideo ? "video" : "image";

  const formData = new FormData();
  formData.append(fieldName, file);

  const response = await fetch(
    `https://api-upload-image-8ym9.onrender.com/api/${folder}`,
    {
      method: "POST",
      headers: {
        "x-api-key": "youris-api-key",
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Upload failed");
  }

  const data = await response.json();
  console.log("Upload successful:", data);
  return data;
}
```

#### Upload Response Example (`200 OK`)

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

---

### 2. Upload using `axios`

```javascript
import axios from "axios";

async function uploadWithAxios(file, folder = "videos") {
  const isVideo = file.type.startsWith("video/");
  const formData = new FormData();
  formData.append(isVideo ? "video" : "image", file);

  const { data } = await axios.post(
    `https://api-upload-image-8ym9.onrender.com/api/${folder}`,
    formData,
    {
      headers: {
        "x-api-key": "youris-api-key",
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}
```

---

### 3. Delete Media

```javascript
async function deleteMedia(publicId, isVideo = false) {
  const endpoint = isVideo ? "videos" : "images";

  const response = await fetch(
    `https://api-upload-image-8ym9.onrender.com/api/${endpoint}/${publicId}`,
    {
      method: "DELETE",
      headers: {
        "x-api-key": "youris-api-key",
      },
    },
  );

  const data = await response.json();
  return data;
}
```

---

## ⚠️ Limits & Error Handling

- **Max File Size**: 50 MB (Files above 50MB will return `400 Bad Request`).
- **Rate Limit**: 100 uploads per 15 minutes per IP.
- **Allowed Formats**:
  - **Images**: `jpg`, `jpeg`, `png`, `webp`, `gif`
  - **Videos**: `mp4`, `mov`, `webm`, `avi`, `mkv`, `3gp`, `m4v`

#### Error Response Format (`400 / 401 / 403 / 429 / 500`)

```json
{
  "error": "File size limit exceeded. Maximum allowed size is 50MB."
}
```
