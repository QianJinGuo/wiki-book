const encoder = new TextEncoder();
const MIN_SECRET_LENGTH = 32;
const USER_ID_LENGTH = 22;
const SIGNATURE_LENGTH = 43;

const ALLOWED_ORIGINS = new Set([
  'https://jinguo.tech',
  'https://wiki.jinguo.tech',
  'http://127.0.0.1:8002',
  'http://localhost:8002',
]);

function getSecret(env) {
  const secret = env.USER_DATA_SECRET;
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) {
    throw new Error('USER_DATA_SECRET is not configured');
  }
  return secret;
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    + '='.repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function signingKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signUserId(userId, secret) {
  const key = await signingKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(userId));
  return toBase64Url(new Uint8Array(signature));
}

export async function createUserSession(env) {
  const secret = getSecret(env);
  const randomId = new Uint8Array(16);
  crypto.getRandomValues(randomId);
  const userId = toBase64Url(randomId);
  const signature = await signUserId(userId, secret);
  return { userId, token: `${userId}.${signature}` };
}

export async function authenticateUser(request, env) {
  let secret;
  try {
    secret = getSecret(env);
  } catch {
    return { ok: false, status: 503, error: 'Sync authentication is not configured' };
  }

  const authorization = request.headers.get('Authorization') || '';
  const match = authorization.match(/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
  if (!match) return { ok: false, status: 401, error: 'Authentication required' };

  const [userId, signature] = match[1].split('.');
  if (userId.length !== USER_ID_LENGTH || signature.length !== SIGNATURE_LENGTH) {
    return { ok: false, status: 401, error: 'Invalid authentication token' };
  }

  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes || signatureBytes.length !== 32) {
    return { ok: false, status: 401, error: 'Invalid authentication token' };
  }

  try {
    const key = await signingKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(userId),
    );
    return valid
      ? { ok: true, userId }
      : { ok: false, status: 401, error: 'Invalid authentication token' };
  } catch {
    return { ok: false, status: 401, error: 'Invalid authentication token' };
  }
}

export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || ALLOWED_ORIGINS.has(origin);
}

export function corsHeaders(request, methods = 'GET, POST, OPTIONS') {
  const headers = { Vary: 'Origin' };
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = methods;
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return headers;
}
