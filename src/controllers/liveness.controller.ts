import { Request, Response } from 'express';
import { LivenessService } from '../services/liveness.service';
import logger from '../utils/logger';

export class LivenessController {
  static async startSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await LivenessService.createSession(userId);
      res.status(201).json({
        message: 'Liveness session started',
        sessionId: session.id,
        challenge: session.challenge,
      });
    } catch (error: any) {
      logger.error('Error starting liveness session', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async validateFrame(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      const file = req.file;

      if (!sessionId) {
        res.status(400).json({ message: 'Session ID is required' });
        return;
      }

      if (!file) {
        res.status(400).json({ message: 'Frame image is required' });
        return;
      }

      const result = await LivenessService.processFrame(sessionId, file.buffer);
      
      res.json({
        message: 'Frame processed',
        result,
      });

    } catch (error: any) {
      logger.error('Error validating frame', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await LivenessService.getSession(id);

      if (!session) {
        res.status(404).json({ message: 'Session not found' });
        return;
      }

      res.json(session);
    } catch (error: any) {
      logger.error('Error getting session', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
