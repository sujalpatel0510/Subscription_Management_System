export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
    return errorResponse('Forbidden: Internal access only', 403);
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      actorUser: {
        select: { id: true, name: true, emailNormalized: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return successResponse({ auditLogs: logs });
}
