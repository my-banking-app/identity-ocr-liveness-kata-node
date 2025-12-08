import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

export class CryptoService {
  /**
   * Encrypts a text using AES-256-CBC
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(config.security.aesKey);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Decrypts a text using AES-256-CBC
   */
  static decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = Buffer.from(config.security.aesKey);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  /**
   * Hashes a password using Bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a password with a hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
