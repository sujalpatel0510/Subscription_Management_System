import { addDays, addWeeks, addMonths, addYears, isAfter } from 'date-fns';
import prisma from './prisma';
import { evaluateEligibleDiscount, incrementDiscountUsage } from './discounts';
import { resolveLineTax } from './tax';
import { logAuditEvent } from './audit';

export function calculateNextBillingPeriod(baseDate: Date, unit: string, count: number = 1): Date {
  const normalized = (unit || 'MONTHLY').toUpperCase();
  switch (normalized) {
    case 'DAILY':
      return addDays(baseDate, count);
    case 'WEEKLY':
      return addWeeks(baseDate, count);
    case 'YEARLY':
      return addYears(baseDate, count);
    case 'MONTHLY':
    default:
      return addMonths(baseDate, count);
  }
}

export async function runRecurringBillingBatch({
  windowDate = new Date(),
  triggeredByUserId,
}: {
  windowDate?: Date;
  triggeredByUserId?: string;
} = {}) {
  const runKey = `RUN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const billingRun = await prisma.billingRun.create({
    data: {
      runKey,
      period: windowDate.toISOString().slice(0, 10),
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  // Query indexed fields (status, nextBillingDate) per PRD 7.4
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { nextBillingDate: { lte: windowDate } },
        { nextBillingDate: null },
      ],
    },
    include: {
      customer: true,
      plan: true,
      items: true,
    },
  });

  let invoicesGenerated = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const sub of dueSubscriptions) {
    try {
      const periodStart = sub.nextBillingDate ? new Date(sub.nextBillingDate) : new Date(sub.startDate);
      const periodEnd = calculateNextBillingPeriod(periodStart, sub.plan.intervalUnit, sub.plan.intervalCount);

      // Check auto-close on expiry
      if (sub.expiryDate && isAfter(periodStart, new Date(sub.expiryDate))) {
        if (sub.autoClose || sub.plan.autoClose) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CLOSED' },
          });
          await prisma.subscriptionEvent.create({
            data: {
              subscriptionId: sub.id,
              fromStatus: 'ACTIVE',
              toStatus: 'CLOSED',
              changedBy: 'SYSTEM_BILLING_JOB',
              reason: 'Term ended with auto-close enabled',
            },
          });
        }
        skippedCount++;
        continue;
      }

      // Critical Idempotency Check: look for existing invoice for this period
      const existing = await prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          periodStart,
          periodEnd,
        },
      });

      if (existing) {
        skippedCount++;
        if (sub.nextBillingDate && new Date(sub.nextBillingDate) <= periodStart) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { nextBillingDate: periodEnd },
          });
        }
        continue;
      }

      // Compute item lines
      let subtotal = 0;
      let totalQty = 0;
      const productIds: string[] = [];

      const rawItems = sub.items.map((item) => {
        const lineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
        subtotal += lineTotal;
        totalQty += item.quantity;
        productIds.push(item.productId);
        return {
          productId: item.productId,
          variantId: item.variantId,
          descriptionSnapshot: item.descriptionSnapshot,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRuleId: item.taxRuleId,
          lineTotal,
        };
      });

      // Best discount
      const discount = await evaluateEligibleDiscount({
        subtotal,
        totalQuantity: totalQty,
        productIds,
      });

      const discountRatio = subtotal > 0 ? discount.discountTotal / subtotal : 0;
      let taxTotal = 0;
      const finalLines = [];

      for (const line of rawItems) {
        const lineDiscount = Number((line.lineTotal * discountRatio).toFixed(2));
        const amountAfterDiscount = Math.max(0, line.lineTotal - lineDiscount);

        const taxRes = await resolveLineTax(amountAfterDiscount, line.taxRuleId);
        taxTotal += taxRes.taxAmount;

        finalLines.push({
          productId: line.productId,
          variantId: line.variantId,
          descriptionSnapshot: line.descriptionSnapshot,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountAmount: lineDiscount,
          taxRate: taxRes.taxRate,
          taxAmount: taxRes.taxAmount,
          lineTotal: Number((amountAfterDiscount + taxRes.taxAmount).toFixed(2)),
        });
      }

      const grandTotal = Number((subtotal - discount.discountTotal + taxTotal).toFixed(2));
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const dueAt = addDays(new Date(), 15);

      // Create invoice and advance next billing date
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          periodStart,
          periodEnd,
          issuedAt: new Date(),
          dueAt,
          status: 'CONFIRMED',
          currency: sub.customer.currency || 'USD',
          subtotal: Number(subtotal.toFixed(2)),
          discountTotal: discount.discountTotal,
          discountRuleId: discount.discountRuleId,
          taxTotal: Number(taxTotal.toFixed(2)),
          grandTotal,
          amountPaid: 0,
          lines: {
            create: finalLines,
          },
        },
      });

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: periodEnd },
      });

      if (discount.discountRuleId) {
        await incrementDiscountUsage(discount.discountRuleId);
      }

      await prisma.notification.create({
        data: {
          type: 'INVOICE_GENERATED',
          recipient: sub.customer.billingEmail,
          subject: `Invoice #${invoice.invoiceNumber} from Brightloop Software`,
          body: `Invoice of ${invoice.currency} ${invoice.grandTotal} generated for period ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}.`,
          relatedEntity: 'Invoice',
          relatedId: invoice.id,
        },
      });

      await logAuditEvent({
        actorUserId: triggeredByUserId || 'SYSTEM_BILLING_JOB',
        action: 'INVOICE_GENERATED',
        entityType: 'Invoice',
        entityId: invoice.id,
        afterJson: {
          invoiceNumber: invoice.invoiceNumber,
          subscriptionId: sub.id,
          grandTotal: invoice.grandTotal,
          periodStart,
          periodEnd,
        },
      });

      invoicesGenerated++;
    } catch (err: any) {
      errors.push(`Sub ${sub.subscriptionNumber}: ${err?.message || err}`);
      console.error(`Billing error on sub ${sub.id}:`, err);
    }
  }

  const status = errors.length > 0 && invoicesGenerated === 0 ? 'FAILED' : 'COMPLETED';
  const summary = `Evaluated: ${dueSubscriptions.length}, Generated: ${invoicesGenerated}, Skipped: ${skippedCount}, Errors: ${errors.length}`;

  return await prisma.billingRun.update({
    where: { id: billingRun.id },
    data: {
      status,
      completedAt: new Date(),
      subscriptionsEvaluated: dueSubscriptions.length,
      invoicesGenerated,
      skippedCount,
      summary,
    },
  });
}
