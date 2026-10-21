import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '../middleware/auth.js';
const router = Router();
const allowedTypes = /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|quicktime))$/;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, allowedTypes.test(file.mimetype)) });
router.post('/', auth, (req, res, next) => upload.single('media')(req, res, error => {
  if (error?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Media must be 50MB or smaller.' });
  if (error || !req.file) return res.status(400).json({ message: 'Choose a JPG, PNG, WebP, GIF, MP4, WebM, or QuickTime file.' });
  next();
}), async (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return res.status(503).json({ message: 'Media storage is not configured. Add Cloudinary credentials to the backend environment.' });
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  try {
    const result = await new Promise((resolve, reject) => { const stream = cloudinary.uploader.upload_stream({ folder: 'mosaic/posts', resource_type: mediaType, use_filename: false, unique_filename: true }, (err, value) => err ? reject(err) : resolve(value)); stream.end(req.file.buffer); });
    res.status(201).json({ imageUrl: result.secure_url, mediaType });
  } catch (error) {
    res.status(502).json({ message: 'Media storage could not accept this file. Please try again.' });
  }
});
export default router;
