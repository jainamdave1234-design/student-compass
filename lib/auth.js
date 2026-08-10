import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'student-compass-default-secure-secret-key-2026';

// Hashing passwords using HMAC-SHA256 with a static salt
export function hashPassword(password) {
  const salt = 'compass-salt-credential-hashing-key';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Signs a lightweight JWT-like token
export function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  // Expiration (7 days)
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const fullPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verifies a JWT-like token
export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, signature] = parts;
  
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
    
  if (signature !== expectedSignature) return null;
  
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Get authenticated user from cookie in Server Actions or Route Handlers
export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifyToken(token);
}
