import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User, Role } from '@/types';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'anjali-spices-dev-secret-change-in-production';
const AUTH_COOKIE_NAME = 'zaffran_auth_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: number;
}

// Simple robust HMAC-SHA256 token generator (runs seamlessly in Node & Edge without extra heavy dependencies)
export function signSession(payload: Omit<SessionPayload, 'expiresAt'>, expiresInMs = 7 * 24 * 60 * 60 * 1000): string {
  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + expiresInMs,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) return null;

    return payload;
  } catch {
    return null;
  }
}

// Server-side helper to get current session from Next.js cookies
export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySession(token);
    if (!payload) return null;

    const db = getDb();
    const user = db.users.find(u => u.id === payload.userId && u.status === 'ACTIVE');
    if (!user) return null;

    // Return safe user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser as User;
  } catch {
    return null;
  }
}

// Role checking helper
export function checkRoleAuthorized(userRole: Role | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  // Superadmin has access to everything
  if (userRole === 'SUPERADMIN') return true;
  return allowedRoles.includes(userRole);
}

// Password helpers
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export { AUTH_COOKIE_NAME };
