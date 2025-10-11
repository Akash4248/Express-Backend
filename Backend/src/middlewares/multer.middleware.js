import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Absolute path for uploads
const uploadPath = path.resolve('./public/temp');

// Ensure folder exists
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({ storage });
