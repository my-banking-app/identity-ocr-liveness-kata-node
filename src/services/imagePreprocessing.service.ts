import sharp from 'sharp';
 

export class ImagePreprocessingService {
  /**
   * Preprocesses an image for better OCR results.
   * - Converts to grayscale
   * - Increases contrast
   * - Resizes if too large
   * - Sharpens
   */
  static async preprocess(filePath: string): Promise<Buffer> {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Basic preprocessing chain
    let processor = image
      .grayscale() // Convert to B&W
      .normalize() // Enhance contrast
      .sharpen();  // Sharpen edges

    // Resize if too large (e.g., width > 2000px)
    if (metadata.width && metadata.width > 2000) {
      processor = processor.resize(2000, null, { withoutEnlargement: true });
    }

    // Convert to buffer for OCR
    return processor.toBuffer();
  }

  /**
   * Validates image quality (basic check).
   * Returns true if image meets minimum requirements.
   */
  static async validateQuality(filePath: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const metadata = await sharp(filePath).metadata();
      
      if (!metadata.width || !metadata.height) {
        return { valid: false, reason: 'Invalid image dimensions' };
      }

      // Check resolution (assuming 72dpi default if undefined, but looking at pixel dimensions)
      // For OCR, we generally want at least 1000px width for full documents
      if (metadata.width < 800 || metadata.height < 600) {
        return { valid: false, reason: 'Resolution too low' };
      }

      // Check for blur (simple variance check is hard with just sharp, relying on metadata for now)
      // A more advanced check would involve edge detection stats
      
      return { valid: true };
    } catch (error: any) {
      return { valid: false, reason: `Image validation failed: ${error.message}` };
    }
  }
}
