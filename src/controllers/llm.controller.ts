import { Request, Response } from 'express';
import { DocumentAnalysisService } from '../services/llm/documentAnalysis.service';
import { ScoringEngineService } from '../services/llm/scoringEngine.service';
import logger from '../utils/logger';

const analysisService = new DocumentAnalysisService();

export class LlmController {
  static async analyzeDocument(req: Request, res: Response) {
    try {
      const { ocrData } = req.body;
      if (!ocrData) {
        return res.status(400).json({ error: 'ocrData is required' });
      }

      const analysis = await analysisService.analyzeDocumentContext(ocrData);
      res.json(analysis);
    } catch (error) {
      logger.error('Error in analyzeDocument controller', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async validateConsistency(req: Request, res: Response) {
    try {
      const { ocrData, validationData } = req.body;
      if (!ocrData || !validationData) {
        return res.status(400).json({ error: 'ocrData and validationData are required' });
      }

      const validation = await analysisService.validateConsistency(ocrData, validationData);
      res.json(validation);
    } catch (error) {
      logger.error('Error in validateConsistency controller', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async calculateRiskScore(req: Request, res: Response) {
    try {
        const scores = req.body;
        // Validate required fields
        const requiredFields = ['ocr_confidence', 'liveness_score', 'deepfake_probability', 'document_validity', 'llm_consistency'];
        const missingFields = requiredFields.filter(field => scores[field] === undefined);

        if (missingFields.length > 0) {
             return res.status(400).json({ error: `Missing scoring components: ${missingFields.join(', ')}` });
        }
        
        const finalScore = ScoringEngineService.calculateFinalScore(scores);
        res.json(finalScore);
    } catch (error) {
        logger.error('Error in calculateRiskScore controller', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
  }
}
