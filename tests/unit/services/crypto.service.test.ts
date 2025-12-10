import { CryptoService } from '../../../src/services/crypto.service';

describe('CryptoService', () => {
  describe('Encryption/Decryption', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const originalText = 'Sensitive Data 123';
      const encrypted = CryptoService.encrypt(originalText);
      
      expect(encrypted).not.toBe(originalText);
      expect(encrypted).toContain(':'); // IV:Content format
      
      const decrypted = CryptoService.decrypt(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it('should produce different outputs for same input due to random IV', () => {
      const text = 'Same Text';
      const enc1 = CryptoService.encrypt(text);
      const enc2 = CryptoService.encrypt(text);
      
      expect(enc1).not.toBe(enc2);
      
      expect(CryptoService.decrypt(enc1)).toBe(text);
      expect(CryptoService.decrypt(enc2)).toBe(text);
    });
  });

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'mySecretPassword123!';
      const hash = await CryptoService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
      const password = 'password123';
      const hash = await CryptoService.hashPassword(password);
      
      const isValid = await CryptoService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'password123';
      const hash = await CryptoService.hashPassword(password);
      
      const isValid = await CryptoService.comparePassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });
});
