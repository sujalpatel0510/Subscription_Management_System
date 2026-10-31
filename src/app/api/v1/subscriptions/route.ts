import { NextRequest } from 'next/server';
import { addYears } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { calculateNextBillingPeriod } from '@/lib/billing';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  // Customer record isolation (AT-04)
  if (authUser.role === 'CUSTOMER') {
    if (!authUser.customerAccountId) return errorResponse('Customer profile not found', 404);
    const subscriptions = await prisma.subscription.findMany({
      where: {
        customerId: authUser.customerAccountId,
        status: statusFilter ? statusFilter.toUpperCase() : undefined,
      },
      include: {
        customer: true,
        plan: true,
        items: true,
        events: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { issuedAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse({ subscriptions });
  }

  // Admin & Staff
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: statusFilter ? statusFilter.toUpperCase() : undefined,
    },
    include: {
      customer: true,
      plan: true,
      items: true,
      events: { orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { issuedAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ subscriptions });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
      return errorResponse('Forbidden: Insufficient permissions', 403);
    }

    const body = await req.json();
    const { customerId, planId, startDate, paymentTerms = 'Net 15', items = [] } = body;

    if (!customerId || !planId || items.length === 0) {
      return errorResponse('Customer, plan, and item lines are required', 400);
    }

    const customer = await prisma.customerAccount.findUnique({ where: { id: customerId } });
    if (!customer) return errorResponse('Customer not found', 404);

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'ACTIVE') return errorResponse('Plan is inactive or not found', 400);

    const start = startDate ? new Date(startDate) : new Date();
    if (plan.availableFrom && start < new Date(plan.availableFrom)) {
      return errorResponse('Start date is before plan availability window.', 400);
    }
    if (plan.availableTo && start > new Date(plan.availableTo)) {
      return errorResponse('Start date is after plan availability window.', 400);
    }

    const expiry = addYears(start, 1);
    const nextBilling = calculateNextBillingPeriod(start, plan.intervalUnit, plan.intervalCount);
    const subNumber = `SUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const totalQty = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);
    if (totalQty < plan.minQuantity) {
      return errorResponse(`Plan requires minimum quantity of ${plan.minQuantity}`, 400);
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber: subNumber,
        customerId,
        planId,
        status: 'ACTIVE',
        startDate: start,
        expiryDate: expiry,
        nextBillingDate: nextBilling,
        paymentTerms,
        autoClose: plan.autoClose,
        allowPause: plan.allowPause,
        allowEarlyClose: plan.allowEarlyClose,
        allowRenew: plan.allowRenew,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            descriptionSnapshot: item.descriptionSnapshot || 'Subscription line item',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate || 0),
            amount: Number((Number(item.quantity || 1) * Number(item.unitPrice)).toFixed(2)),
          })),
        },
        events: {
          create: {
            fromStatus: 'DRAFT',
            toStatus: 'ACTIVE',
            changedBy: authUser.email,
            reason: 'Created by staff directly',
          },
        },
      },
      include: {
        customer: true,
        plan: true,
        items: true,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'SUBSCRIPTION_CREATED',
      entityType: 'Subscription',
      entityId: subscription.id,
      afterJson: { subscriptionNumber: subscription.subscriptionNumber },
    });

    return successResponse({ subscription }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create subscription', 500);
  }
}
