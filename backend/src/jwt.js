import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_ISSUER = process.env.JWT_ISSUER || 'vibevault-backend';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign a JWT for an authenticated user.
 * @param {{ userId: string, handle: string }} payload
 * @returns {string}
 */
export function signToken({ userId, handle }) {
  return jwt.sign({ sub: userId, handle }, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT and return its decoded payload.
 * @param {string} token
 * @returns {import('jsonwebtoken').JwtPayload & { sub: string; handle: string }}
 */
export function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
  if (typeof decoded === 'string' || !decoded.sub || !decoded.handle) {
    throw new Error('Invalid token payload');
  }
  return /** @type {any} */ (decoded);
}
