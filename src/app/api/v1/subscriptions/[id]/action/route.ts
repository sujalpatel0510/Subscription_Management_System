import { NextRequest } from 'next/server';
import { addYears } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { calculateNextBillingPeriod } from '@/lib/billing';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        plan: true,
        items: true,
      },
    });

    if (!subscription) return errorResponse('Subscription not found', 404);

    if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== subscription.customerId) {
      return errorResponse('Forbidden: You do not have permission for this subscription', 403);
    }

    const { action, reason } = await req.json();
    const actionUpper = (action || '').toUpperCase();

    // 1. PAUSE
    if (actionUpper === 'PAUSE') {
      if (!subscription.allowPause || !subscription.plan.allowPause) {
        return errorResponse('Action rejected: Plan does not allow pausing.', 400);
      }
      if (subscription.status !== 'ACTIVE') {
        return errorResponse(`Cannot pause subscription with status ${subscription.status}.`, 400);
      }

      const updated = await prisma.$transaction([
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAUSED' },
        }),
        prisma.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            fromStatus: 'ACTIVE',
            toStatus: 'PAUSED',
            changedBy: authUser.email,
            reason: reason || 'Subscription paused',
          },
        }),
      ]);

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'SUBSCRIPTION_PAUSED',
        entityType: 'Subscription',
        entityId: subscription.id,
        afterJson: { status: 'PAUSED', reason },
      });

      return successResponse({ message: 'Subscription successfully paused.', subscription: updated[0] });
    }

    // 2. RESUME
    if (actionUpper === 'RESUME') {
      if (subscription.status !== 'PAUSED') {
        return errorResponse(`Cannot resume subscription with status ${subscription.status}.`, 400);
      }

      const updated = await prisma.$transaction([
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        }),
        prisma.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            fromStatus: 'PAUSED',
            toStatus: 'ACTIVE',
            changedBy: authUser.email,
            reason: reason || 'Subscription resumed',
          },
        }),
      ]);

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'SUBSCRIPTION_RESUMED',
        entityType: 'Subscription',
        entityId: subscription.id,
        afterJson: { status: 'ACTIVE' },
      });

      return successResponse({ message: 'Subscription successfully resumed.', subscription: updated[0] });
    }

    // 3. CLOSE
    if (actionUpper === 'CLOSE') {
      if (!subscription.allowEarlyClose || !subscription.plan.allowEarlyClose) {
        return errorResponse('Action rejected: Plan does not allow early closure.', 400);
      }
      if (subscription.status === 'CLOSED') {
        return errorResponse('Subscription is already closed.', 400);
      }

      const prev = subscription.status;
      const updated = await prisma.$transaction([
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'CLOSED' },
        }),
        prisma.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            fromStatus: prev,
            toStatus: 'CLOSED',
            changedBy: authUser.email,
            reason: reason || 'Early closure requested',
          },
        }),
      ]);

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'SUBSCRIPTION_CLOSED',
        entityType: 'Subscription',
        entityId: subscription.id,
        afterJson: { status: 'CLOSED', reason },
      });

      return successResponse({ message: 'Subscription closed.', subscription: updated[0] });
    }

    // 4. RENEW
    if (actionUpper === 'RENEW') {
      if (!subscription.allowRenew || !subscription.plan.allowRenew) {
        return errorResponse('Action rejected: Plan does not allow renewal.', 400);
      }

      const newStart = new Date(subscription.expiryDate);
      const newExpiry = addYears(newStart, 1);
      const newNextBilling = calculateNextBillingPeriod(newStart, subscription.plan.intervalUnit, subscription.plan.intervalCount);
      const newNumber = `SUB-${newStart.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const successor = await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { status: 'CLOSED' },
        });

        await tx.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            fromStatus: subscription.status,
            toStatus: 'CLOSED',
            changedBy: authUser.email,
            reason: `Term renewed into successor ${newNumber}`,
          },
        });

        const newSub = await tx.subscription.create({
          data: {
            subscriptionNumber: newNumber,
            customerId: subscription.customerId,
            planId: subscription.planId,
            status: 'ACTIVE',
            startDate: newStart,
            expiryDate: newExpiry,
            nextBillingDate: newNextBilling,
            paymentTerms: subscription.paymentTerms,
            autoClose: subscription.plan.autoClose,
            allowPause: subscription.plan.allowPause,
            allowEarlyClose: subscription.plan.allowEarlyClose,
            allowRenew: subscription.plan.allowRenew,
            renewedFromId: subscription.id,
            items: {
              create: subscription.items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                descriptionSnapshot: i.descriptionSnapshot,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxRate: i.taxRate,
                amount: i.amount,
              })),
            },
            events: {
              create: {
                fromStatus: 'QUOTATION',
                toStatus: 'ACTIVE',
                changedBy: authUser.email,
                reason: `Renewed successor from ${subscription.subscriptionNumber}`,
              },
            },
          },
          include: {
            customer: true,
            plan: true,
            items: true,
          },
        });

        return newSub;
      });

      await logAuditEvent({
        actorUserId: authUser.userId,
        action: 'SUBSCRIPTION_RENEWED',
        entityType: 'Subscription',
        entityId: successor.id,
        afterJson: {
          originalSubscription: subscription.subscriptionNumber,
          successorSubscription: successor.subscriptionNumber,
        },
      });

      return successResponse({
        message: 'Subscription successfully renewed with linked successor term.',
        subscription: successor,
      });
    }

    return errorResponse(`Unsupported action: ${action}. Allowed: PAUSE, RESUME, CLOSE, RENEW`, 400);
  } catch (err: any) {
    return errorResponse(err.message || 'Action failed', 500);
  }
}
