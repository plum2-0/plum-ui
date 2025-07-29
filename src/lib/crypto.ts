import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const algorithm = 'aes-256-gcm'
const saltLength = 32
const tagLength = 16
const ivLength = 16

export class TokenEncryption {
  private key: Buffer

  constructor(encryptionKey: string) {
    if (!encryptionKey) {
      throw new Error('Encryption key is required')
    }
    // Derive a key from the encryption key
    const salt = Buffer.from('plum-token-encryption-salt', 'utf8')
    this.key = scryptSync(encryptionKey, salt, 32)
  }

  encrypt(text: string): string {
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, this.key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ])
    
    const tag = cipher.getAuthTag()
    
    // Combine iv + tag + encrypted content
    const combined = Buffer.concat([iv, tag, encrypted])
    
    return combined.toString('base64')
  }

  decrypt(encryptedText: string): string {
    const combined = Buffer.from(encryptedText, 'base64')
    
    // Extract components
    const iv = combined.subarray(0, ivLength)
    const tag = combined.subarray(ivLength, ivLength + tagLength)
    const encrypted = combined.subarray(ivLength + tagLength)
    
    const decipher = createDecipheriv(algorithm, this.key, iv)
    decipher.setAuthTag(tag)
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
    
    return decrypted.toString('utf8')
  }
}

// Factory function to create encryption instance
export function createTokenEncryption(): TokenEncryption {
  const encryptionKey = process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  return new TokenEncryption(encryptionKey)
}