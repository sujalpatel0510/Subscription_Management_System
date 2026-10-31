export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return errorResponse('Unauthorized', 401);
  }

  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : null;
  const toDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : null;
  
  // If customer role, strictly lock customerId to their own customerAccountId (AT-04 isolation)
  const customerId = authUser.role === 'CUSTOMER'
    ? (authUser.customerAccountId || undefined)
    : (searchParams.get('customerId') || undefined);

  const now = new Date();

  // 1. Active Subscriptions & MRR calculation
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      customerId,
    },
    include: {
      plan: true,
      items: true,
    },
  });

  let mrr = 0;
  for (const sub of activeSubscriptions) {
    const subLineTotal = sub.items.reduce((acc, i) => acc + i.amount, 0);
    const interval = sub.plan.intervalUnit.toUpperCase();
    if (interval === 'MONTHLY') {
      mrr += subLineTotal;
    } else if (interval === 'YEARLY') {
      mrr += subLineTotal / 12;
    } else if (interval === 'WEEKLY') {
      mrr += (subLineTotal * 52) / 12;
    } else if (interval === 'DAILY') {
      mrr += subLineTotal * 30;
    }
  }
  const arr = Number((mrr * 12).toFixed(2));
  mrr = Number(mrr.toFixed(2));

  // 2. Invoices query with date filtering
  const invoiceWhere: any = {
    customerId,
    status: { not: 'CANCELLED' },
  };
  if (fromDate || toDate) {
    invoiceWhere.issuedAt = {};
    if (fromDate) invoiceWhere.issuedAt.gte = fromDate;
    if (toDate) invoiceWhere.issuedAt.lte = toDate;
  }

  const allInvoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    include: { customer: true },
  });

  let totalBilled = 0;
  let totalOutstanding = 0;
  const overdueInvoices: any[] = [];

  for (const inv of allInvoices) {
    totalBilled += inv.grandTotal;
    const balance = Number((inv.grandTotal - inv.amountPaid).toFixed(2));
    if (inv.status !== 'PAID') {
      totalOutstanding += balance;
    }

    // Overdue condition per PRD 5.6 & AT-11
    if (inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueAt) < now && balance > 0) {
      overdueInvoices.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.legalName,
        dueAt: inv.dueAt,
        grandTotal: inv.grandTotal,
        amountPaid: inv.amountPaid,
        outstandingBalance: balance,
      });
    }
  }

  // 3. Cash Collected (Payment allocations)
  const paymentAllocWhere: any = {
    payment: { status: 'COMPLETED' },
    invoice: customerId ? { customerId } : undefined,
  };
  if (fromDate || toDate) {
    paymentAllocWhere.allocatedAt = {};
    if (fromDate) paymentAllocWhere.allocatedAt.gte = fromDate;
    if (toDate) paymentAllocWhere.allocatedAt.lte = toDate;
  }

  const paymentAllocations = await prisma.paymentAllocation.findMany({
    where: paymentAllocWhere,
  });

  const cashCollected = paymentAllocations.reduce((acc, a) => acc + a.allocatedAmount, 0);
  const overdueTotalValue = overdueInvoices.reduce((acc, inv) => acc + inv.outstandingBalance, 0);

  return successResponse({
    metrics: {
      activeSubscriptionsCount: activeSubscriptions.length,
      totalBilled: Number(totalBilled.toFixed(2)),
      cashCollected: Number(cashCollected.toFixed(2)),
      outstandingBalance: Number(totalOutstanding.toFixed(2)),
      overdueInvoicesCount: overdueInvoices.length,
      overdueTotalValue: Number(overdueTotalValue.toFixed(2)),
      mrr,
      arr,
      currency: 'USD',
    },
    overdueInvoices,
  });
}
