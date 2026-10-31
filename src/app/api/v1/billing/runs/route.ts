import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { runRecurringBillingBatch } from '@/lib/billing';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
    return errorResponse('Forbidden: Internal access only', 403);
  }

  const runs = await prisma.billingRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  return successResponse({ billingRuns: runs });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
      return errorResponse('Forbidden: Internal access only', 403);
    }

    const body = await req.json().catch(() => ({}));
    const windowDate = body.windowDate ? new Date(body.windowDate) : new Date();

    const result = await runRecurringBillingBatch({
      windowDate,
      triggeredByUserId: authUser.userId,
    });

    return successResponse({
      message: 'Billing run finished.',
      billingRun: result,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Billing batch failed', 500);
  }
}
