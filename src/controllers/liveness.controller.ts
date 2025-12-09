import { Request, Response } from 'express';
import { LivenessService } from '../services/liveness.service';
import logger from '../utils/logger';
import { livenessCheckCounter } from '../services/logging/metrics.service';
import { AuditService } from '../services/logging/audit.service';

export class LivenessController {
  static async startSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const session = await LivenessService.createSession(userId);
      try {
        AuditService.logBusinessEvent({
          action: 'LIVENESS_START',
          resource: session.id,
          userId,
          result: 'SUCCESS',
          details: { challenge: session.challenge },
          sensitive: false,
        });
      } catch {}
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

      const before = await LivenessService.getSession(sessionId);
      const prevStatus = before?.status || 'PENDING';
      const result = await LivenessService.processFrame(sessionId, file.buffer);
      const after = await LivenessService.getSession(sessionId);
      
      try {
        const userId = (req as any).user?.userId;
        if (prevStatus === 'PENDING' && after?.status === 'PASSED') {
          livenessCheckCounter.labels('passed', 'false').inc();
          AuditService.logBusinessEvent({
            action: 'LIVENESS_PASSED',
            resource: sessionId,
            userId,
            result: 'SUCCESS',
            details: { score: result.score },
            sensitive: false,
          });
        }
        // Do not log intermediate failures here; only final failures via finalize endpoint
      } catch {}

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

  static async finalizeSession(req: Request, res: Response) {
    try {
      const { sessionId, reason } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }
      const userId = (req as any).user?.userId;
      livenessCheckCounter.labels('failed', 'false').inc();
      AuditService.logBusinessEvent({
        action: 'LIVENESS_FAIL',
        resource: sessionId,
        userId,
        result: 'FAILURE',
        details: { reason },
        sensitive: false,
      });
      res.json({ message: 'Session finalized' });
    } catch (error: any) {
      logger.error('Error finalizing liveness session', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
