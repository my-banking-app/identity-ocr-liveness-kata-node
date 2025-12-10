import { Router } from 'express';
import multer from 'multer';
import { OCRController } from '../controllers/ocr.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { ocrConfig } from '../config/ocr.config';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ocrConfig.tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: ocrConfig.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (ocrConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Routes

// 1. Analyze Document (Sync) - Protected
router.post(
  '/analyze',
  authenticateToken,
  upload.single('document'),
  OCRController.analyzeDocument,
);

// 2. Queue Analysis (Async) - Protected
router.post(
  '/queue',
  authenticateToken,
  upload.single('document'),
  OCRController.queueAnalysis,
);

// 3. Check Job Status - Protected
router.get(
  '/status/:id',
  authenticateToken,
  OCRController.getJobStatus,
);

export default router;
