import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
    return errorResponse('Forbidden: Internal access only', 403);
  }

  const discountRules = await prisma.discountRule.findMany({
    include: {
      eligibilities: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ discountRules });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    // Explicit security rule per PRD 5.5 & AT-03: Staff CANNOT create discount rules!
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only administrators can create discount rules.', 403);
    }

    const body = await req.json();
    const {
      code,
      name,
      type = 'PERCENTAGE',
      value,
      minAmount,
      minQuantity,
      startsAt,
      endsAt,
      usageLimit,
      scopeType = 'ALL',
      productIds = [],
    } = body;

    if (!code || !name || value === undefined) {
      return errorResponse('Code, name, and value are required', 400);
    }

    const upperCode = code.trim().toUpperCase();
    const existing = await prisma.discountRule.findUnique({
      where: { code: upperCode },
    });
    if (existing) {
      return errorResponse('A discount rule with this code already exists', 409);
    }

    const discountRule = await prisma.discountRule.create({
      data: {
        code: upperCode,
        name,
        type: type.toUpperCase(),
        value: Number(value),
        minAmount: minAmount !== undefined && minAmount !== null ? Number(minAmount) : null,
        minQuantity: minQuantity !== undefined && minQuantity !== null ? Number(minQuantity) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimit: usageLimit !== undefined && usageLimit !== null ? Number(usageLimit) : null,
        scopeType: scopeType.toUpperCase(),
        active: true,
        eligibilities: productIds.length > 0 ? {
          create: productIds.map((pId: string) => ({ productId: pId })),
        } : undefined,
      },
      include: {
        eligibilities: true,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'DISCOUNT_RULE_CREATED',
      entityType: 'DiscountRule',
      entityId: discountRule.id,
      afterJson: discountRule,
    });

    return successResponse({ discountRule }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create discount rule', 500);
  }
}
