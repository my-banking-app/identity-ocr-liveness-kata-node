 

export const ocrConfig = {
  supportedLanguages: ['eng', 'spa'],
  tempDir: 'uploads/temp',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379'),
  },
};
