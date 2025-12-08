export class PromptManagerService {
  static getDocumentAnalysisPrompt(ocrData: any): string {
    return `
      Analyze the following document data extracted via OCR for logical consistency and potential fraud indicators.
      
      OCR Data:
      ${JSON.stringify(ocrData, null, 2)}
      
      Tasks:
      1. Verify if dates are logically consistent (e.g., birth date < issue date < expiry date).
      2. Check if the age calculated from birth date matches the visual age context (if provided) or is plausible.
      3. Detect any patterns that look like generated text or placeholders.
      4. Validate if the format of ID numbers, names, and addresses looks natural for the document type (if inferred).
      
      Return a JSON object with the following structure:
      {
        "valid": boolean,
        "inconsistencies": string[], // list of specific issues found
        "confidence": number, // 0-100
        "risk_factors": string[]
      }
    `;
  }

  static getCrossValidationPrompt(ocrData: any, validationData: any): string {
    return `
      Compare the OCR extracted data with the external validation data.
      
      OCR Data:
      ${JSON.stringify(ocrData, null, 2)}
      
      Validation Data:
      ${JSON.stringify(validationData, null, 2)}
      
      Identify any discrepancies. Be tolerant of minor OCR errors (e.g., '0' vs 'O', '1' vs 'I') but strict on core identity data.
      
      Return a JSON object with the following structure:
      {
        "match": boolean,
        "discrepancies": string[],
        "match_score": number // 0-100
      }
    `;
  }
}
