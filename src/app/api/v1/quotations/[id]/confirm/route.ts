import { NextRequest } from 'next/server';
import { addYears, isBefore } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { calculateNextBillingPeriod } from '@/lib/billing';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    if (!quotation) return errorResponse('Quotation not found', 404);

    // Customer can confirm own quotation; internal users can confirm any
    if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== quotation.customerId) {
      return errorResponse('Forbidden: You can only confirm your own quotations', 403);
    }

    // Expiry check (AT-07)
    const now = new Date();
    if (isBefore(new Date(quotation.expiryDate), now)) {
      return errorResponse('Quotation has expired and cannot be confirmed without authorized renewal.', 400);
    }

    if (quotation.status === 'CONFIRMED') {
      return errorResponse('Quotation has already been confirmed.', 400);
    }

    if (!quotation.plan) {
      return errorResponse('Quotation does not have a linked plan.', 400);
    }

    const startDate = new Date();
    const expiryDate = addYears(startDate, 1);
    const nextBillingDate = calculateNextBillingPeriod(startDate, quotation.plan.intervalUnit, quotation.plan.intervalCount);
    const subscriptionNumber = `SUB-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const subscription = await prisma.$transaction(async (tx) => {
      await tx.quotation.update({
        where: { id: quotation.id },
        data: { status: 'CONFIRMED' },
      });

      const sub = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          planId: quotation.planId!,
          quotationId: quotation.id,
          status: 'ACTIVE',
          startDate,
          expiryDate,
          nextBillingDate,
          paymentTerms: 'Net 15',
          autoClose: quotation.plan!.autoClose,
          allowPause: quotation.plan!.allowPause,
          allowEarlyClose: quotation.plan!.allowEarlyClose,
          allowRenew: quotation.plan!.allowRenew,
          items: {
            create: quotation.lines.map((ql) => ({
              productId: ql.productId,
              variantId: ql.variantId,
              descriptionSnapshot: ql.descriptionSnapshot,
              quantity: ql.quantity,
              unitPrice: ql.unitPrice,
              taxRate: ql.taxRate,
              amount: ql.lineTotal,
            })),
          },
          events: {
            create: {
              fromStatus: 'QUOTATION',
              toStatus: 'ACTIVE',
              changedBy: authUser.email,
              reason: `Converted from quotation #${quotation.quoteNumber}`,
            },
          },
        },
        include: {
          customer: true,
          plan: true,
          items: true,
        },
      });

      return sub;
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'QUOTATION_CONFIRMED',
      entityType: 'Subscription',
      entityId: subscription.id,
      afterJson: {
        subscriptionNumber: subscription.subscriptionNumber,
        quotationId: quotation.id,
      },
    });

    return successResponse({
      message: 'Quotation confirmed and subscription activated.',
      subscription,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to confirm quotation', 500);
  }
}
