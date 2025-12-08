import Queue from 'bull';
import { OCRService } from './ocr.service';
import { ocrConfig } from '../config/ocr.config';
import logger from '../utils/logger';
import { OCRJobData } from '../types/ocr.types';

// Create Queue
// Note: If Redis is not available, this might fail to connect. 
// For this Kata, we'll try to connect, but handle errors gracefully or just assume Redis is there.
const ocrQueue = new Queue<OCRJobData>('ocr-processing', {
  redis: ocrConfig.redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Process Jobs
ocrQueue.process(async (job) => {
  const { filePath, userId } = job.data;
  logger.info(`Processing OCR job for user ${userId}, file: ${filePath}`);

  try {
    const result = await OCRService.processImage(filePath);
    logger.info(`OCR Job completed for user ${userId}`);
    return result;
  } catch (error: any) {
    logger.error(`OCR Job failed for user ${userId}: ${error.message}`);
    throw error;
  }
});

// Event Listeners
ocrQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed. Result confidence: ${result.confidence}`);
  // In a real app, you might notify the user via WebSocket or Webhook here
});

ocrQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error ${err.message}`);
});

export { ocrQueue };
