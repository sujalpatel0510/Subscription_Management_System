import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  const isInternal = authUser && (authUser.role === 'ADMIN' || authUser.role === 'STAFF');

  const plans = await prisma.plan.findMany({
    where: isInternal ? undefined : { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ plans });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admins can configure plans', 403);
    }

    const body = await req.json();
    const {
      name,
      price,
      intervalUnit = 'MONTHLY',
      intervalCount = 1,
      minQuantity = 1,
      availableFrom,
      availableTo,
      autoClose = false,
      allowEarlyClose = true,
      allowPause = true,
      allowRenew = true,
    } = body;

    if (!name || price === undefined) {
      return errorResponse('Plan name and price are required', 400);
    }

    const validUnits = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    if (!validUnits.includes(intervalUnit.toUpperCase())) {
      return errorResponse('Invalid intervalUnit. Allowed: DAILY, WEEKLY, MONTHLY, YEARLY', 400);
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price: Number(price),
        intervalUnit: intervalUnit.toUpperCase(),
        intervalCount: Number(intervalCount) || 1,
        minQuantity: Number(minQuantity) || 1,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        autoClose: Boolean(autoClose),
        allowEarlyClose: Boolean(allowEarlyClose),
        allowPause: Boolean(allowPause),
        allowRenew: Boolean(allowRenew),
        status: 'ACTIVE',
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PLAN_CREATED',
      entityType: 'Plan',
      entityId: plan.id,
      afterJson: plan,
    });

    return successResponse({ plan }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create plan', 500);
  }
}
