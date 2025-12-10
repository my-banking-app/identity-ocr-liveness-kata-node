import app from './app';
import { config } from './config/env';
import logger from './utils/logger';
import { initDatabase } from './config/database';
import { LivenessService } from './services/liveness.service';
import { DeepfakeDetectionService } from './ml/services/deepfakeDetection.service';

const startServer = async () => {
  await initDatabase();
  await LivenessService.initialize(); // Preload models
  await DeepfakeDetectionService.initialize(); // Preload ML models

  app.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

startServer();
