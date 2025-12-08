import { Router } from 'express';
import { LlmController } from '../controllers/llm.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/analyze-document', authenticateToken, LlmController.analyzeDocument);
router.post('/validate-consistency', authenticateToken, LlmController.validateConsistency);
router.post('/calculate-score', authenticateToken, LlmController.calculateRiskScore);

export default router;
