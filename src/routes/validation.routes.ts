import { Router } from 'express';
import { ValidationController } from '../controllers/validation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/cedula', authenticateToken, ValidationController.validateCedula);
router.post('/passport', authenticateToken, ValidationController.validatePassport);
router.post('/license', authenticateToken, ValidationController.validateLicense);
router.post('/blacklist-check', authenticateToken, ValidationController.checkBlacklist);
router.post('/cross-check', authenticateToken, ValidationController.crossCheck);
router.get('/status/:number', authenticateToken, ValidationController.getDocumentStatus);

export default router;
