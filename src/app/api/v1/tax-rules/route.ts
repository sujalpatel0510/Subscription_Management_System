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

  const taxRules = await prisma.taxRate.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ taxRules });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can configure tax rules', 403);
    }

    const { name, rate, calculationType = 'PERCENTAGE', jurisdiction = 'GLOBAL', active = true } = await req.json();
    if (!name || rate === undefined) {
      return errorResponse('Tax rule name and rate are required', 400);
    }

    const taxRule = await prisma.taxRate.create({
      data: {
        name,
        rate: Number(rate),
        calculationType,
        jurisdiction,
        active: Boolean(active),
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'TAX_RULE_CREATED',
      entityType: 'TaxRate',
      entityId: taxRule.id,
      afterJson: taxRule,
    });

    return successResponse({ taxRule }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create tax rule', 500);
  }
}
