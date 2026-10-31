export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.id },
    include: { subscriptions: true, quotations: true },
  });

  if (!plan) return errorResponse('Plan not found', 404);
  return successResponse({ plan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can update plans', 403);
    }

    const body = await req.json();
    const existing = await prisma.plan.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Plan not found', 404);

    const updated = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        intervalUnit: body.intervalUnit ? body.intervalUnit.toUpperCase() : undefined,
        intervalCount: body.intervalCount !== undefined ? Number(body.intervalCount) : undefined,
        minQuantity: body.minQuantity !== undefined ? Number(body.minQuantity) : undefined,
        availableFrom: body.availableFrom !== undefined ? (body.availableFrom ? new Date(body.availableFrom) : null) : undefined,
        availableTo: body.availableTo !== undefined ? (body.availableTo ? new Date(body.availableTo) : null) : undefined,
        autoClose: body.autoClose !== undefined ? Boolean(body.autoClose) : undefined,
        allowEarlyClose: body.allowEarlyClose !== undefined ? Boolean(body.allowEarlyClose) : undefined,
        allowPause: body.allowPause !== undefined ? Boolean(body.allowPause) : undefined,
        allowRenew: body.allowRenew !== undefined ? Boolean(body.allowRenew) : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PLAN_UPDATED',
      entityType: 'Plan',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ plan: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update plan', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete plans', 403);
    }

    const existing = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { subscriptions: true, quotations: true },
        },
      },
    });

    if (!existing) return errorResponse('Plan not found', 404);

    if (existing._count.subscriptions > 0) {
      // If plan has active or historical subscriptions, archive it instead of hard-failing
      const archived = await prisma.plan.update({
        where: { id: params.id },
        data: { status: 'INACTIVE' },
      });

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'PLAN_ARCHIVED',
        entityType: 'Plan',
        entityId: existing.id,
        beforeJson: existing,
        afterJson: archived,
      });

      return successResponse({
        message: 'Plan has associated subscriptions. It has been deactivated (INACTIVE).',
        plan: archived,
        archived: true,
      });
    }

    await prisma.quotationTemplate.updateMany({
      where: { planId: params.id },
      data: { planId: null },
    });

    await prisma.quotation.updateMany({
      where: { planId: params.id },
      data: { planId: null },
    });

    const deleted = await prisma.plan.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PLAN_DELETED',
      entityType: 'Plan',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Plan deleted successfully', plan: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete plan', 500);
  }
}
