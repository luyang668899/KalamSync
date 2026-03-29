import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Generate encryption key
   * @param {string} password - User password for encryption
   * @returns {Buffer} - Encryption key
   */
  generateKey(password) {
    return crypto.scryptSync(password, 'openmtp-salt', 32);
  }

  /**
   * Encrypt a file
   * @param {string} inputPath - Path to the input file
   * @param {string} outputPath - Path to the encrypted output file
   * @param {string} password - Encryption password
   * @returns {Promise<boolean>} - Success status
   */
  async encryptFile(inputPath, outputPath, password) {
    return new Promise((resolve, reject) => {
      try {
        const key = this.generateKey(password);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        
        output.write(iv);
        
        input.pipe(cipher).pipe(output);
        
        output.on('finish', () => {
          resolve(true);
        });
        
        output.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Decrypt a file
   * @param {string} inputPath - Path to the encrypted input file
   * @param {string} outputPath - Path to the decrypted output file
   * @param {string} password - Encryption password
   * @returns {Promise<boolean>} - Success status
   */
  async decryptFile(inputPath, outputPath, password) {
    return new Promise((resolve, reject) => {
      try {
        const key = this.generateKey(password);
        
        const input = fs.createReadStream(inputPath);
        const output = fs.createWriteStream(outputPath);
        
        // Read the IV from the beginning of the file
        const iv = Buffer.alloc(16);
        let bytesRead = 0;
        
        input.on('data', (chunk) => {
          if (bytesRead < 16) {
            const remaining = 16 - bytesRead;
            chunk.copy(iv, bytesRead, 0, remaining);
            bytesRead += remaining;
            
            if (bytesRead === 16) {
              const cipher = crypto.createDecipheriv(this.algorithm, key, iv);
              input.pipe(cipher).pipe(output);
            }
          }
        });
        
        output.on('finish', () => {
          resolve(true);
        });
        
        output.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Encrypt a string
   * @param {string} text - Text to encrypt
   * @param {string} password - Encryption password
   * @returns {string} - Encrypted text (base64 encoded)
   */
  encryptText(text, password) {
    const key = this.generateKey(password);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
  }

  /**
   * Decrypt a string
   * @param {string} encryptedText - Encrypted text (base64 encoded)
   * @param {string} password - Encryption password
   * @returns {string} - Decrypted text
   */
  decryptText(encryptedText, password) {
    const [ivBase64, encryptedData] = encryptedText.split(':');
    const key = this.generateKey(password);
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

const encryptionService = new EncryptionService();
export default encryptionService;