export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  if (authUser.role === 'CUSTOMER') {
    if (!authUser.customerAccountId) return errorResponse('Customer profile not found', 404);
    const payments = await prisma.payment.findMany({
      where: {
        allocations: {
          some: {
            invoice: { customerId: authUser.customerAccountId },
          },
        },
      },
      include: {
        allocations: {
          include: { invoice: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });
    return successResponse({ payments });
  }

  // Staff and Admin
  const payments = await prisma.payment.findMany({
    include: {
      createdBy: { select: { id: true, name: true, emailNormalized: true } },
      allocations: {
        include: {
          invoice: {
            include: { customer: true },
          },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  });

  return successResponse({ payments });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return errorResponse('Unauthorized: Please log in', 401);
    }

    const body = await req.json();
    const { invoiceId, amount, method = 'CREDIT_CARD', reference, note, paidAt } = body;

    if (!invoiceId || amount === undefined || Number(amount) <= 0) {
      return errorResponse('Valid invoiceId and positive payment amount are required.', 400);
    }

    const payAmount = Number(Number(amount).toFixed(2));

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) return errorResponse('Invoice not found', 404);

    // Customer can pay their own invoices; staff/admin can record for any
    if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== invoice.customerId) {
      return errorResponse('Forbidden: You can only pay invoices issued to your account', 403);
    }

    if (invoice.status === 'CANCELLED') {
      return errorResponse('Cannot record payment against a cancelled invoice.', 400);
    }

    const currentBalance = Number((invoice.grandTotal - invoice.amountPaid).toFixed(2));
    if (currentBalance <= 0) {
      return errorResponse('Invoice is already fully paid.', 400);
    }

    // Overpayment check per PRD 5.6
    if (payAmount > currentBalance) {
      return errorResponse(
        `Payment amount ($${payAmount}) exceeds invoice outstanding balance ($${currentBalance}). Overpayment is not permitted.`,
        400
      );
    }

    const paymentNumber = `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentDate = paidAt ? new Date(paidAt) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          method: method.toUpperCase(),
          amount: payAmount,
          currency: invoice.currency,
          paidAt: paymentDate,
          reference: reference || null,
          note: note || null,
          createdById: authUser.userId,
          status: 'COMPLETED',
          allocations: {
            create: {
              invoiceId: invoice.id,
              allocatedAmount: payAmount,
              allocatedAt: paymentDate,
            },
          },
        },
        include: { allocations: true },
      });

      const newAmountPaid = Number((invoice.amountPaid + payAmount).toFixed(2));
      const isFullyPaid = newAmountPaid >= invoice.grandTotal;
      const newStatus = isFullyPaid ? 'PAID' : 'PARTIALLY_PAID';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
      });

      return { payment, updatedInvoice };
    });

    await prisma.notification.create({
      data: {
        type: 'PAYMENT_RECEIPT',
        recipient: invoice.customer.billingEmail,
        subject: `Payment receipt #${result.payment.paymentNumber} for invoice #${invoice.invoiceNumber}`,
        body: `Payment of ${invoice.currency} ${payAmount} via ${method} received for invoice #${invoice.invoiceNumber}. Remaining balance: ${invoice.currency} ${(invoice.grandTotal - result.updatedInvoice.amountPaid).toFixed(2)}.`,
        relatedEntity: 'Payment',
        relatedId: result.payment.id,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: result.payment.id,
      afterJson: {
        paymentNumber: result.payment.paymentNumber,
        invoiceId: invoice.id,
        amount: payAmount,
        newInvoiceStatus: result.updatedInvoice.status,
      },
    });

    return successResponse({
      message: 'Payment recorded and allocated successfully.',
      payment: result.payment,
      invoice: result.updatedInvoice,
    }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to record payment', 500);
  }
}
