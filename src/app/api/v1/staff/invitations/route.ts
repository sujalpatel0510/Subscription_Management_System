export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, normalizeEmail, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    // Explicit security check per PRD 5.1 & AT-03: Only ADMIN can invite or create staff!
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only administrators can invite or create staff accounts.', 403);
    }

    const { email, name, temporaryPassword } = await req.json();
    if (!email) return errorResponse('Email is required', 400);

    const emailNormalized = normalizeEmail(email);

    const existing = await prisma.user.findUnique({
      where: { emailNormalized },
    });
    if (existing) {
      return errorResponse('A user with this email already exists', 409);
    }

    const passwordHash = await hashPassword(temporaryPassword || 'BrightStaff#2026');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const newStaff = await prisma.user.create({
      data: {
        emailNormalized,
        name: name || 'Staff Member',
        passwordHash,
        role: 'STAFF',
        status: 'ACTIVE',
      },
    });

    await prisma.staffInvite.create({
      data: {
        email: emailNormalized,
        role: 'STAFF',
        tokenHash,
        invitedById: authUser.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        type: 'STAFF_INVITE',
        recipient: emailNormalized,
        subject: 'You have been invited to join Brightloop Software staff',
        body: `Welcome ${name || 'Staff Member'}! Your staff account has been provisioned.`,
        relatedEntity: 'User',
        relatedId: newStaff.id,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'STAFF_INVITED',
      entityType: 'User',
      entityId: newStaff.id,
      afterJson: { email: emailNormalized, role: 'STAFF' },
    });

    return successResponse({
      message: 'Staff account successfully created.',
      user: {
        id: newStaff.id,
        email: newStaff.emailNormalized,
        role: newStaff.role,
        name: newStaff.name,
      },
    }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create staff invitation', 500);
  }
}
