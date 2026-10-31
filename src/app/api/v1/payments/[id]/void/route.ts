import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
      return errorResponse('Forbidden: Internal access only', 403);
    }

    const { reason } = await req.json();
    if (!reason) {
      return errorResponse('Audit reason is required to void a payment.', 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { allocations: true },
    });

    if (!payment) return errorResponse('Payment not found', 404);
    if (payment.status === 'VOIDED') {
      return errorResponse('Payment has already been voided.', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'VOIDED',
          voidReason: reason,
        },
      });

      for (const alloc of payment.allocations) {
        const inv = await tx.invoice.findUnique({ where: { id: alloc.invoiceId } });
        if (inv) {
          const recalculatedPaid = Math.max(0, Number((inv.amountPaid - alloc.allocatedAmount).toFixed(2)));
          let newStatus = inv.status;
          if (recalculatedPaid <= 0) {
            newStatus = 'CONFIRMED';
          } else if (recalculatedPaid < inv.grandTotal) {
            newStatus = 'PARTIALLY_PAID';
          }

          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              amountPaid: recalculatedPaid,
              status: newStatus,
            },
          });
        }
      }
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PAYMENT_VOIDED',
      entityType: 'Payment',
      entityId: payment.id,
      beforeJson: { status: 'COMPLETED', amount: payment.amount },
      afterJson: { status: 'VOIDED', reason },
    });

    return successResponse({ message: 'Payment successfully voided.' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to void payment', 500);
  }
}
