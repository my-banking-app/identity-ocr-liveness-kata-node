import { createWorker } from 'tesseract.js';
import { ImagePreprocessingService } from './imagePreprocessing.service';
import { OCRResult } from '../types/ocr.types';
import logger from '../utils/logger';

export class OCRService {
  static async processImage(filePath: string): Promise<OCRResult> {
    try {
      // 1. Preprocess Image
      const imageBuffer = await ImagePreprocessingService.preprocess(filePath);

      // 2. Initialize Tesseract Worker
      const worker = await createWorker('eng+spa'); // Load English and Spanish
      
      // 3. Perform OCR
      const { data: { text, confidence } } = await worker.recognize(imageBuffer);
      
      await worker.terminate();

      // 4. Basic Data Extraction (Regex based - simple implementation)
      // This is a naive implementation. In a real scenario, use specific templates.
      const extractedData = this.extractDataFromText(text);

      return {
        text,
        confidence,
        data: extractedData
      };

    } catch (error: any) {
      logger.error(`OCR Processing failed: ${error.message}`);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  private static extractDataFromText(text: string) {
    const data: any = {};
    
    // Simple Heuristics / Regex for common fields
    
    // Document Number (e.g., Colombian CC is often just numbers, 6-10 digits)
    // 1. Try finding with prefix (C.C., NUIP, etc.)
    let idMatch = text.match(/(?:C\.?C\.?|NUIP|NUMERO)\.?\s*([\d\.]+)/i);
    
    // 2. Fallback: Look for the specific pattern of a Colombian ID (e.g. 1.022.954.370)
    if (!idMatch) {
        // We use a looser regex that allows spaces or dots between digits to catch "1 . 022" cases
        // Capture a sequence that starts and ends with a digit, contains digits/dots/spaces
        const potentialMatches = text.matchAll(/(?:\b|\D)([\d][\d\.\s]{5,}[\d])(?:\b|\D)/g);
        
        for (const match of potentialMatches) {
            const raw = match[1];
            const clean = raw.replace(/[^\d]/g, '');
            // Check if length is valid for an ID (7 to 10 digits)
            if (clean.length >= 7 && clean.length <= 10) {
                // If we found a valid length, use it.
                // Prefer matches that look "more" like IDs (e.g. contain dots in right places) if we had multiple,
                // but taking the first valid one is usually fine for this demo.
                data.documentNumber = clean;
                break;
            }
        }
    }
    
    // 3. Last Resort: Simple contiguous block
    if (!data.documentNumber && !idMatch) {
         const simpleMatch = text.match(/\b(\d{7,10})\b/);
         if (simpleMatch) {
             data.documentNumber = simpleMatch[1];
         }
    }

    // Ensure documentNumber is set if idMatch was found in step 1
    if (idMatch && !data.documentNumber) {
        data.documentNumber = idMatch[1].replace(/[^\d]/g, '');
    }

    // Name - Very hard without strict template, looking for uppercase lines
    // This is a placeholder logic
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    // data.rawLines = lines; // For debugging

    // Date of Birth (DD/MM/YYYY or similar)
    const dateMatch = text.match(/(\d{2}[-./]\d{2}[-./]\d{4})/);
    if (dateMatch) {
      data.dob = dateMatch[1];
    }

    return data;
  }
}
