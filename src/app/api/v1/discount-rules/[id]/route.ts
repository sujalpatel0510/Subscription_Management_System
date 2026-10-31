import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const discountRule = await prisma.discountRule.findUnique({
    where: { id: params.id },
    include: { eligibilities: true },
  });

  if (!discountRule) return errorResponse('Discount rule not found', 404);
  return successResponse({ discountRule });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only administrators can modify discount rules.', 403);
    }

    const body = await req.json();
    const existing = await prisma.discountRule.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Discount rule not found', 404);

    const updated = await prisma.discountRule.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        value: body.value !== undefined ? Number(body.value) : undefined,
        minAmount: body.minAmount !== undefined ? (body.minAmount ? Number(body.minAmount) : null) : undefined,
        minQuantity: body.minQuantity !== undefined ? (body.minQuantity ? Number(body.minQuantity) : null) : undefined,
        startsAt: body.startsAt !== undefined ? (body.startsAt ? new Date(body.startsAt) : null) : undefined,
        endsAt: body.endsAt !== undefined ? (body.endsAt ? new Date(body.endsAt) : null) : undefined,
        usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? Number(body.usageLimit) : null) : undefined,
        active: body.active !== undefined ? Boolean(body.active) : undefined,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'DISCOUNT_RULE_UPDATED',
      entityType: 'DiscountRule',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ discountRule: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update discount rule', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only administrators can delete discount rules.', 403);
    }

    const existing = await prisma.discountRule.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Discount rule not found', 404);

    await prisma.discountEligibility.deleteMany({
      where: { discountRuleId: params.id },
    });

    const deleted = await prisma.discountRule.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'DISCOUNT_RULE_DELETED',
      entityType: 'DiscountRule',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Discount rule deleted successfully', discountRule: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete discount rule', 500);
  }
}
