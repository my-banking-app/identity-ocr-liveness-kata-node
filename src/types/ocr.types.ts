export interface OCRResult {
  text: string;
  confidence: number;
  data: {
    documentNumber?: string;
    name?: string;
    dob?: string;
    raw?: any;
  };
}

export interface OCRJobData {
  filePath: string;
  userId: string;
}
