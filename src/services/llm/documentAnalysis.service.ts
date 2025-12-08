import { LlmProviderService } from './llmProvider.service';
import { PromptManagerService } from './promptManager.service';
import logger from '../../utils/logger';

export class DocumentAnalysisService {
  private llmProvider: LlmProviderService;

  constructor() {
    this.llmProvider = new LlmProviderService();
  }

  async analyzeDocumentContext(ocrData: any): Promise<any> {
    try {
      const prompt = PromptManagerService.getDocumentAnalysisPrompt(ocrData);
      return await this.llmProvider.generateJSON(prompt);
    } catch (error) {
      logger.error('Error in document analysis', { error });
      // Return a safe fallback to allow process to continue
      return {
        valid: false,
        inconsistencies: ['Error during AI analysis'],
        confidence: 0,
        risk_factors: ['AI_SERVICE_ERROR']
      };
    }
  }

  async validateConsistency(ocrData: any, validationData: any): Promise<any> {
    try {
      const prompt = PromptManagerService.getCrossValidationPrompt(ocrData, validationData);
      return await this.llmProvider.generateJSON(prompt);
    } catch (error) {
      logger.error('Error in consistency validation', { error });
      return {
        match: false,
        discrepancies: ['Error during AI validation'],
        match_score: 0
      };
    }
  }
}
