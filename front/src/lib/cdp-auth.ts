/**
 * CDP API Authentication Helper
 * Generates JWT tokens for CDP REST API v2 authentication
 */

import { createHmac, randomBytes } from 'crypto'

export interface CdpCredentials {
  apiKeyId: string
  apiKeySecret: string
}

/**
 * Generate CDP Bearer Token (JWT) for API authentication
 * Using HMAC-SHA256 (HS256) with the CDP SDK credential format
 */
export function generateCdpJWT(credentials: CdpCredentials): string {
  const { apiKeyId, apiKeySecret } = credentials
  
  // JWT Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: apiKeyId
  }
  
  // JWT Payload
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: 'coinbase-cloud',
    sub: apiKeyId,
    aud: [],
    iat: now,
    nbf: now,
    exp: now + 60, // 1 minute expiry
    jti: randomBytes(16).toString('hex')
  }
  
  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  
  // Create signature
  const message = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', Buffer.from(apiKeySecret, 'base64'))
    .update(message)
    .digest('base64url')
  
  // Return complete JWT
  return `${message}.${signature}`
}

