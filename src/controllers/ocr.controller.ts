import { Request, Response } from 'express';
import { ocrQueue } from '../services/ocrQueue.service';
import { ImagePreprocessingService } from '../services/imagePreprocessing.service';
import { OCRService } from '../services/ocr.service';
import logger from '../utils/logger';

export class OCRController {
  
  // Synchronous Processing (for testing/demo mostly, or fast operations)
  static async analyzeDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      // 1. Validate Quality
      const validation = await ImagePreprocessingService.validateQuality(req.file.path);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason });
      }

      // 2. Process Directly (Sync)
      const result = await OCRService.processImage(req.file.path);
      
      res.json(result);
    } catch (error: any) {
      logger.error(`OCR Analysis Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  // Asynchronous Processing (Queue)
  static async queueAnalysis(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      const userId = (req as any).user?.userId || 'anonymous'; // From Auth Middleware

      // Add to Queue
      const job = await ocrQueue.add({
        filePath: req.file.path,
        userId,
      });

      res.status(202).json({
        message: 'Document accepted for processing',
        jobId: job.id,
        statusUrl: `/api/ocr/status/${job.id}`
      });

    } catch (error: any) {
      logger.error(`Queue Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  static async getJobStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await ocrQueue.getJob(id);

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const state = await job.getState();
      const result = job.returnvalue;
      const reason = job.failedReason;

      res.json({
        id: job.id,
        state,
        result,
        error: reason
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
