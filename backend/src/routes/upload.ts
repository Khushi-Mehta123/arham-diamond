import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Use memory storage to store files in memory as buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|mov|avi|mkv|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|video/.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif) and videos (mp4, mov, avi, mkv, webm) are allowed'));
  }
});

router.post('/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const isVideo = req.file.mimetype.startsWith('video');
      const resourceType = isVideo ? 'video' : 'image';

      // Upload buffer to Cloudinary using upload_stream
      const uploadToCloudinary = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder: 'arham_diamonds',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(req.file!.buffer);
        });
      };

      const result = await uploadToCloudinary();
      return res.json({ url: result.secure_url });
    } catch (uploadErr: any) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ message: `Cloudinary upload failed: ${uploadErr.message || uploadErr}` });
    }
  });
});

export default router;
