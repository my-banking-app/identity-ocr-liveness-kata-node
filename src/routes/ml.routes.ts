import { Router } from 'express';
import multer from 'multer';
import { MLController } from '../controllers/ml.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import path from 'path';

const router = Router();

// Use disk storage for ML processing to handle larger files if needed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post(
  '/detect-deepfake',
  authenticateToken,
  upload.single('image'),
  MLController.detectDeepfake
);

router.post(
  '/validate-document',
  authenticateToken,
  upload.single('document'),
  MLController.validateDocument
);

export default router;
