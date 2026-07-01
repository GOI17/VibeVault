import jwt from 'jsonwebtoken';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUER = 'https://accounts.google.com';

let cachedCerts = /** @type {Record<string, string>|null} */ (null);
let cachedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

/**
 * Fetch Google's public signing certificates with simple caching.
 * @returns {Promise<Record<string, string>>}
 */
async function getGoogleCerts() {
  const now = Date.now();
  if (cachedCerts && cachedAt + CACHE_TTL_MS > now) {
    return cachedCerts;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google certs: ${res.status}`);
  }
  const data = await res.json();
  cachedCerts = Object.fromEntries(data.keys.map((k) => [k.kid, `-----BEGIN PUBLIC KEY-----\n${k.n}\n-----END PUBLIC KEY-----`]));
  cachedAt = now;
  return cachedCerts;
}

/**
 * Verify a Google ID token and return the subject and display name.
 *
 * NOTE: This is a minimal verification using the raw RSA modulus from
 * Google's jwks endpoint. In production, prefer a library such as
 * `google-auth-library` or `jose` for full JWK support.
 *
 * @param {string} idToken
 * @returns {Promise<{ sub: string; email?: string; name?: string }>}
 */
export async function verifyGoogleIdToken(idToken) {
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || typeof decodedHeader === 'string' || !decodedHeader.header.kid) {
    throw new Error('Invalid ID token header');
  }
  const certs = await getGoogleCerts();
  const key = certs[decodedHeader.header.kid];
  if (!key) {
    throw new Error('Unknown Google signing key');
  }
  const payload = jwt.verify(idToken, key, {
    algorithms: ['RS256'],
    issuer: [GOOGLE_ISSUER, 'accounts.google.com'],
    audience: process.env.GOOGLE_CLIENT_ID || undefined,
  });
  if (typeof payload === 'string' || !payload.sub) {
    throw new Error('Invalid ID token payload');
  }
  return {
    sub: payload.sub,
    email: payload.email || undefined,
    name: payload.name || undefined,
  };
}
