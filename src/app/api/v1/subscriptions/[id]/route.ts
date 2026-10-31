import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      plan: true,
      items: true,
      events: { orderBy: { createdAt: 'desc' } },
      invoices: {
        include: { lines: true, allocations: true },
        orderBy: { issuedAt: 'desc' },
      },
    },
  });

  if (!subscription) return errorResponse('Subscription not found', 404);

  // Customer isolation (AT-04)
  if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== subscription.customerId) {
    return errorResponse('Forbidden: You do not have access to this subscription', 403);
  }

  return successResponse({ subscription });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'STAFF')) {
      return errorResponse('Forbidden: Only admin/staff can update subscriptions', 403);
    }

    const body = await req.json();
    const existing = await prisma.subscription.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Subscription not found', 404);

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        paymentTerms: body.paymentTerms !== undefined ? body.paymentTerms : undefined,
        autoClose: body.autoClose !== undefined ? Boolean(body.autoClose) : undefined,
        allowPause: body.allowPause !== undefined ? Boolean(body.allowPause) : undefined,
        allowRenew: body.allowRenew !== undefined ? Boolean(body.allowRenew) : undefined,
        nextBillingDate: body.nextBillingDate !== undefined ? (body.nextBillingDate ? new Date(body.nextBillingDate) : null) : undefined,
        expiryDate: body.expiryDate !== undefined ? new Date(body.expiryDate) : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
      include: { customer: true, plan: true, items: true },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'SUBSCRIPTION_UPDATED',
      entityType: 'Subscription',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ subscription: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update subscription', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete subscriptions', 403);
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: { invoices: true },
    });

    if (!existing) return errorResponse('Subscription not found', 404);

    // If invoices exist, close the subscription to maintain invoice integrity
    if (existing.invoices.length > 0) {
      const closed = await prisma.subscription.update({
        where: { id: params.id },
        data: { status: 'CLOSED' },
      });

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'SUBSCRIPTION_CLOSED',
        entityType: 'Subscription',
        entityId: existing.id,
        beforeJson: existing,
        afterJson: closed,
      });

      return successResponse({
        message: 'Subscription has linked billing history. It has been closed.',
        subscription: closed,
      });
    }

    await prisma.subscriptionItem.deleteMany({ where: { subscriptionId: params.id } });
    await prisma.subscriptionEvent.deleteMany({ where: { subscriptionId: params.id } });

    const deleted = await prisma.subscription.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'SUBSCRIPTION_DELETED',
      entityType: 'Subscription',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Subscription deleted successfully', subscription: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete subscription', 500);
  }
}
