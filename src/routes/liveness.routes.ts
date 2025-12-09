import { Router } from 'express';
import multer from 'multer';
import { LivenessController } from '../controllers/liveness.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/start-session',
  authenticateToken,
  LivenessController.startSession
);

router.post(
  '/validate-frame',
  authenticateToken,
  upload.single('frame'),
  LivenessController.validateFrame
);

router.get(
  '/session/:id',
  authenticateToken,
  LivenessController.getSession
);

router.post(
  '/finalize',
  authenticateToken,
  LivenessController.finalizeSession
);

export default router;
