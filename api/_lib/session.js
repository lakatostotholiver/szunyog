import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'diktalas_session';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 nap

function getSigningSecret() {
  const password = process.env.DIKTALAS_PASSWORD;
  if (!password) throw new Error('DIKTALAS_PASSWORD environment variable is missing');
  return createHmac('sha256', 'szunyog-diktalas-session-v1').update(password).digest();
}

function sign(payload) {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
}

function isHttps(req) {
  return req.headers['x-forwarded-proto'] === 'https' || req.socket?.encrypted === true;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    cookies[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return cookies;
}

export function createSessionCookie(req) {
  const payload = String(Date.now() + MAX_AGE_MS);
  const value = `${payload}.${sign(payload)}`;
  const secure = isHttps(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=${value}; HttpOnly; Path=/; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(req) {
  const secure = isHttps(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function isAuthenticated(req) {
  const value = parseCookies(req)[COOKIE_NAME];
  if (!value) return false;

  const [expiresAt, signature] = value.split('.');
  if (!expiresAt || !signature) return false;
  if (Date.now() > Number(expiresAt)) return false;

  const expected = Buffer.from(sign(expiresAt), 'hex');
  const actual = Buffer.from(signature, 'hex');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function checkPassword(password) {
  const expected = process.env.DIKTALAS_PASSWORD;
  if (!expected || typeof password !== 'string') return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
