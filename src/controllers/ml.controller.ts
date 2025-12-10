import { Request, Response } from 'express';
import { DeepfakeDetectionService } from '../ml/services/deepfakeDetection.service';
import fs from 'node:fs';
import logger from '../utils/logger';

export class MLController {
  static async detectDeepfake(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      logger.info(`Starting deepfake detection for file: ${req.file.filename}`);
      const buffer = fs.readFileSync(req.file.path);
      
      const result = await DeepfakeDetectionService.analyzeImage(buffer);

      // Clean up uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        logger.error('Failed to delete uploaded file', e);
      }

      res.json(result);
    } catch (error: any) {
      logger.error('Deepfake detection controller error', error);
      if (req.file && fs.existsSync(req.file.path)) {
         try { fs.unlinkSync(req.file.path); } catch (e) { logger.error('Failed to cleanup uploaded file', e); }
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async validateDocument(req: Request, res: Response) {
    // Placeholder for document validation (Fase 5 - Step 3)
    res.status(501).json({ 
      message: 'Document validation with ML not yet implemented',
      note: 'Pending implementation of anomaly detection models'
    });
  }
}
