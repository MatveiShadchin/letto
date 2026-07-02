import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'letto-admin-session';
const SESSION_MARKER = 'letto-admin-v1';

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || '';
}

export function createAdminSessionValue(): string {
  const password = getAdminPassword();
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return createHmac('sha256', password).update(SESSION_MARKER).digest('hex');
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;

  const password = getAdminPassword();
  if (!password) return false;

  try {
    const expected = createAdminSessionValue();
    const actual = Buffer.from(token, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    return actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf);
  } catch {
    return false;
  }
}

export function isAdminPasswordValid(password: string): boolean {
  const configured = getAdminPassword();
  if (!configured) return false;

  try {
    const a = Buffer.from(password);
    const b = Buffer.from(configured);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
