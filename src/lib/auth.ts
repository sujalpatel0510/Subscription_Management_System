import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop-super-secure-jwt-production-secret-2026';
const TOKEN_EXPIRY = '7d';

export interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

/**
 * Validates password policy according to PRD FR-01 / Updated PRD 5.1:
 * - More than 8 characters (>= 9 chars)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export function validatePasswordPolicy(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 9) {
    return { valid: false, message: 'Password must be at least 9 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character.' };
  }
  return { valid: true };
}

/**
 * Normalizes email: trim whitespace and lowercase for database uniqueness
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Hashes password using bcrypt with high cost factor
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verifies password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs JWT token
 */
export function signAuthToken(payload: AuthPrincipal): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifies JWT token
 */
export function verifyAuthToken(token: string): AuthPrincipal | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPrincipal;
  } catch {
    return null;
  }
}

/**
 * Resolves authenticated principal from request Authorization header or Cookie
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthPrincipal | null> {
  let token: string | undefined;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    token = req.cookies.get('bl_token')?.value;
  }

  if (!token) return null;

  const decoded = verifyAuthToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { customerAccount: true },
  });

  if (!user || user.status !== 'ACTIVE') return null;

  return {
    userId: user.id,
    email: user.emailNormalized,
    role: user.role as 'ADMIN' | 'STAFF' | 'CUSTOMER',
    name: user.name,
    customerAccountId: user.customerAccount?.id ?? null,
  };
}

/**
 * Checks role permissions
 */
export function hasRole(user: AuthPrincipal | null, allowed: ('ADMIN' | 'STAFF' | 'CUSTOMER')[]): boolean {
  if (!user) return false;
  return allowed.includes(user.role);
}
