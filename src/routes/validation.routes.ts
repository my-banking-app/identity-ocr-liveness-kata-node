import { Router } from 'express';
import multer from 'multer';
import { ValidationController } from '../controllers/validation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/cedula', authenticateToken, ValidationController.validateCedula);
router.post('/passport', authenticateToken, ValidationController.validatePassport);
router.post('/license', authenticateToken, ValidationController.validateLicense);
router.post('/blacklist-check', authenticateToken, ValidationController.checkBlacklist);
router.post('/cross-check', authenticateToken, ValidationController.crossCheck);
router.get('/status/:number', authenticateToken, ValidationController.getDocumentStatus);

router.post(
  '/face-match',
  authenticateToken,
  upload.fields([{ name: 'doc', maxCount: 1 }, { name: 'live', maxCount: 1 }]),
  ValidationController.faceMatch,
);

export default router;
