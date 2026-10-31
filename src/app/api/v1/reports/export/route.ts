import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
    return errorResponse('Forbidden: Internal access only', 403);
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'invoices';

  if (type === 'subscriptions') {
    const subs = await prisma.subscription.findMany({
      include: { customer: true, plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = 'Subscription Number,Customer,Plan,Status,Start Date,Expiry Date,Next Billing Date,Payment Terms\n';
    const rows = subs
      .map(
        (s) =>
          `"${s.subscriptionNumber}","${s.customer.legalName}","${s.plan.name}","${s.status}","${s.startDate.toISOString().slice(0, 10)}","${s.expiryDate.toISOString().slice(0, 10)}","${s.nextBillingDate ? s.nextBillingDate.toISOString().slice(0, 10) : ''}","${s.paymentTerms}"`
      )
      .join('\n');

    return new NextResponse(headers + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscriptions_export.csv"',
      },
    });
  }

  if (type === 'payments') {
    const payments = await prisma.payment.findMany({
      include: {
        allocations: { include: { invoice: { include: { customer: true } } } },
      },
      orderBy: { paidAt: 'desc' },
    });

    const headers = 'Payment Number,Method,Amount,Currency,Paid At,Reference,Customer,Invoice Number,Status\n';
    const rows = payments
      .map((p) => {
        const inv = p.allocations[0]?.invoice;
        return `"${p.paymentNumber}","${p.method}","${p.amount}","${p.currency}","${p.paidAt.toISOString().slice(0, 10)}","${p.reference || ''}","${inv?.customer.legalName || ''}","${inv?.invoiceNumber || ''}","${p.status}"`;
      })
      .join('\n');

    return new NextResponse(headers + rows, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="payments_export.csv"',
      },
    });
  }

  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { issuedAt: 'desc' },
  });

  const headers = 'Invoice Number,Customer,Issued Date,Due Date,Status,Subtotal,Discount,Tax,Grand Total,Amount Paid,Balance\n';
  const rows = invoices
    .map((inv) => {
      const balance = (inv.grandTotal - inv.amountPaid).toFixed(2);
      return `"${inv.invoiceNumber}","${inv.customer.legalName}","${inv.issuedAt.toISOString().slice(0, 10)}","${inv.dueAt.toISOString().slice(0, 10)}","${inv.status}","${inv.subtotal}","${inv.discountTotal}","${inv.taxTotal}","${inv.grandTotal}","${inv.amountPaid}","${balance}"`;
    })
    .join('\n');

  return new NextResponse(headers + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="invoices_export.csv"',
    },
  });
}
