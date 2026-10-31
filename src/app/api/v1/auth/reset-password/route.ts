export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { validatePasswordPolicy, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return errorResponse('Token and new password are required.', 400);
    }

    const check = validatePasswordPolicy(newPassword);
    if (!check.valid) {
      return errorResponse(check.message || 'Password does not meet security requirements.', 400);
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord || resetRecord.usedAt !== null || resetRecord.expiresAt < new Date()) {
      return errorResponse('Reset token is invalid or expired.', 400);
    }

    const newHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return successResponse({ message: 'Password reset successfully. You may now log in.' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to reset password', 500);
  }
}
