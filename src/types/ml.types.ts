export interface DeepfakeAnalysisResult {
  isReal: boolean;
  score: number; // 0-1 (0 = Fake, 1 = Real)
  confidence: number;
  artifacts: string[];
  processingTimeMs: number;
}

export interface DocumentAnalysisResult {
  isValid: boolean;
  tamperingDetected: boolean;
  details: {
    exifValid: boolean;
    compressionAnomalies: boolean;
    patternMismatch: boolean;
  };
}

export interface MLModelConfig {
  modelPath: string;
  inputShape: [number, number, number]; // e.g. [224, 224, 3]
  threshold: number;
}
