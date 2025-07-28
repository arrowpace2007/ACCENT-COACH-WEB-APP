import crypto from 'crypto'

export class DataProtection {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly tagLength = 16

  private getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET
    if (!key) {
      throw new Error('Encryption key not configured')
    }
    
    // Derive a consistent key from the secret
    return crypto.scryptSync(key, 'salt', this.keyLength)
  }

  // Encrypt audio data for storage
  encryptAudioData(audioBuffer: Buffer): {
    encryptedData: Buffer
    iv: Buffer
    tag: Buffer
  } {
    const key = this.getEncryptionKey()
    const iv = crypto.randomBytes(this.ivLength)
    
    const cipher = crypto.createCipherGCM(this.algorithm, key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(audioBuffer),
      cipher.final()
    ])
    
    const tag = cipher.getAuthTag()
    
    return {
      encryptedData: encrypted,
      iv,
      tag
    }
  }

  // Decrypt audio data
  decryptAudioData(
    encryptedData: Buffer,
    iv: Buffer,
    tag: Buffer
  ): Buffer {
    const key = this.getEncryptionKey()
    
    const decipher = crypto.createDecipherGCM(this.algorithm, key, iv)
    decipher.setAuthTag(tag)
    
    return Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ])
  }

  // Hash sensitive data for indexing
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
  }

  // Generate secure tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Anonymize user data for analytics
  anonymizeUserId(userId: string): string {
    return this.hashData(`${userId}:${process.env.ANONYMIZATION_SALT || 'default-salt'}`)
  }

  // GDPR-compliant data retention
  shouldRetainData(createdAt: Date, dataType: 'audio' | 'analysis' | 'session'): boolean {
    const now = new Date()
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    
    const retentionPeriods = {
      audio: 30,    // 30 days for audio recordings
      analysis: 365, // 1 year for analysis results
      session: 730,  // 2 years for session data
    }
    
    return daysSinceCreation < retentionPeriods[dataType]
  }

  // Sanitize audio metadata
  sanitizeAudioMetadata(metadata: any): any {
    const allowedFields = [
      'duration',
      'sampleRate',
      'channels',
      'format',
      'quality',
      'timestamp'
    ]
    
    const sanitized: any = {}
    for (const field of allowedFields) {
      if (metadata[field] !== undefined) {
        sanitized[field] = metadata[field]
      }
    }
    
    return sanitized
  }

  // Generate consent token for audio processing
  generateConsentToken(userId: string, purpose: string): string {
    const payload = {
      userId,
      purpose,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    const data = JSON.stringify(payload)
    const signature = crypto
      .createHmac('sha256', this.getEncryptionKey())
      .update(data)
      .digest('hex')
    
    return Buffer.from(`${data}.${signature}`).toString('base64')
  }

  // Verify consent token
  verifyConsentToken(token: string): {
    valid: boolean
    userId?: string
    purpose?: string
    timestamp?: number
  } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8')
      const [data, signature] = decoded.split('.')
      
      const expectedSignature = crypto
        .createHmac('sha256', this.getEncryptionKey())
        .update(data)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return { valid: false }
      }
      
      const payload = JSON.parse(data)
      
      // Check if token is expired (24 hours)
      if (Date.now() - payload.timestamp > 86400000) {
        return { valid: false }
      }
      
      return {
        valid: true,
        userId: payload.userId,
        purpose: payload.purpose,
        timestamp: payload.timestamp
      }
    } catch (error) {
      return { valid: false }
    }
  }
}

export const dataProtection = new DataProtection()