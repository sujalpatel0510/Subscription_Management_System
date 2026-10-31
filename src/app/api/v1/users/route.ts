import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user || !hasRole(user, ['ADMIN', 'STAFF'])) {
    return errorResponse('Forbidden: Internal access only', 403);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      emailNormalized: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      customerAccount: {
        select: { id: true, legalName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ users });
}
