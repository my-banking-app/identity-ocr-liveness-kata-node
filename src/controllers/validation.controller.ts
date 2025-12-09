import { Request, Response } from 'express';
import { DocumentRepositoryService } from '../services/validation/documentRepository.service';
import { DocumentAlgorithms } from '../utils/validation/documentAlgorithms.utils';
import { FaceMatchService } from '../services/validation/faceMatch.service';
import logger from '../utils/logger';
import { documentValidationCounter } from '../services/logging/metrics.service';
import { AuditService } from '../services/logging/audit.service';

export class ValidationController {
  
  static async validateCedula(req: Request, res: Response) {
    const { documentNumber } = req.body;
    if (!documentNumber) return res.status(400).json({ error: 'Document number required' });

    const result = await DocumentRepositoryService.validateDocument(documentNumber, 'cedula');
    try {
      const labelResult = result.source === 'BLACKLIST' ? 'blacklisted' : (result.isValid ? 'valid' : 'invalid');
      documentValidationCounter.labels('cedula', labelResult).inc();
      AuditService.logBusinessEvent({
        action: 'DOCUMENT_VALIDATION',
        resource: 'CEDULA',
        userId: (req as any).user?.userId,
        result: (labelResult === 'valid') ? 'SUCCESS' : 'FAILURE',
        details: { documentNumber, status: result.isValid ? 'VALID' : 'INVALID', source: result.source, reason: (result as any).details?.reason || (typeof (result as any).details === 'string' ? (result as any).details : undefined) },
        sensitive: true,
      });
    } catch {}
    res.json(result);
  }

  static async validatePassport(req: Request, res: Response) {
    const { documentNumber, mrz } = req.body;
    
    // MRZ Check if provided
    if (mrz && !DocumentAlgorithms.validateMRZ(mrz)) {
        return res.status(400).json({ error: 'Invalid MRZ format' });
    }

    const result = await DocumentRepositoryService.validateDocument(documentNumber, 'passport');
    res.json(result);
  }

  static async validateLicense(req: Request, res: Response) {
    const { documentNumber } = req.body;
    const result = await DocumentRepositoryService.validateDocument(documentNumber, 'license');
    res.json(result);
  }

  static async checkBlacklist(req: Request, res: Response) {
      // Direct blacklist check endpoint
      const { documentNumber } = req.body;
      // Reusing the service logic which checks blacklist first
      const result = await DocumentRepositoryService.validateDocument(documentNumber, 'cedula'); 
      // If source is BLACKLIST, it's blacklisted.
      
      if (result.source === 'BLACKLIST') {
          return res.json({ blacklisted: true, details: result.details });
      }
      res.json({ blacklisted: false });
  }

  static async getDocumentStatus(req: Request, res: Response) {
    const { number } = req.params;
    const result = await DocumentRepositoryService.getDocumentStatus(number);
    res.json(result);
  }

  static async crossCheck(req: Request, res: Response) {
      const { documentNumber, type, name, issueDate } = req.body;
      
      if (!documentNumber || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await DocumentRepositoryService.crossCheck({
          documentNumber,
          type,
          name,
          issueDate
      });
      res.json(result);
  }

  static async faceMatch(req: Request, res: Response) {
    try {
      const files = (req as any).files as { [fieldname: string]: any[] } | any[] | undefined;
      const docFromFiles = Array.isArray(files) ? undefined : files?.['doc']?.[0]?.buffer;
      const liveFromFiles = Array.isArray(files) ? undefined : files?.['live']?.[0]?.buffer;
      const doc = (req as any).fileDoc?.buffer || docFromFiles || (req as any).docBuffer;
      const live = (req as any).fileLive?.buffer || liveFromFiles || (req as any).liveBuffer;
      if (!doc || !live) {
        return res.status(400).json({ error: 'Both doc and live images are required' });
      }

      const result = await FaceMatchService.compare(doc, live);
      documentValidationCounter.labels('face_match', result.match ? 'match' : 'no_match').inc();
      res.json(result);
    } catch (error: any) {
      logger.error('Face match error', error);
      res.status(500).json({ error: error.message });
    }
  }
}
