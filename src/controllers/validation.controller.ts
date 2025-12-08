import { Request, Response } from 'express';
import { DocumentRepositoryService } from '../services/validation/documentRepository.service';
import { DocumentAlgorithms } from '../utils/validation/documentAlgorithms.utils';

export class ValidationController {
  
  static async validateCedula(req: Request, res: Response) {
    const { documentNumber } = req.body;
    if (!documentNumber) return res.status(400).json({ error: 'Document number required' });

    const result = await DocumentRepositoryService.validateDocument(documentNumber, 'cedula');
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
}
