import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeEmail, verifyPassword, signAuthToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse('Email and password are required.', 400);
    }

    const emailNormalized = normalizeEmail(email);

    const user = await prisma.user.findUnique({
      where: { emailNormalized },
      include: { customerAccount: true },
    });

    if (!user) {
      return errorResponse('Invalid email or password.', 401);
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse('Account is suspended or deactivated.', 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse('Invalid email or password.', 401);
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.emailNormalized,
      role: user.role as any,
      name: user.name,
      customerAccountId: user.customerAccount?.id ?? null,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.emailNormalized,
        role: user.role,
        name: user.name,
        customerAccountId: user.customerAccount?.id,
      },
      token,
    });

    response.cookies.set('bl_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return errorResponse(error.message || 'Authentication failed.', 500);
  }
}
