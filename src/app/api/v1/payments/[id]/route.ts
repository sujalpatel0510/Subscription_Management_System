export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  const payment = await prisma.payment.findUnique({
    where: { id: params.id },
    include: {
      allocations: {
        include: {
          invoice: {
            include: { customer: true },
          },
        },
      },
      createdBy: true,
    },
  });

  if (!payment) return errorResponse('Payment not found', 404);

  return successResponse({ payment });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN'])) {
      return errorResponse('Forbidden: Only admin can delete payments', 403);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { allocations: true },
    });

    if (!payment) return errorResponse('Payment not found', 404);

    // If it's already voided and has no active impact, or void it with reason
    if (payment.status !== 'VOIDED') {
      // Revert invoice allocations first
      await prisma.$transaction(async (tx) => {
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
              data: { amountPaid: recalculatedPaid, status: newStatus },
            });
          }
        }
        await tx.paymentAllocation.deleteMany({ where: { paymentId: payment.id } });
        await tx.payment.delete({ where: { id: payment.id } });
      });
    } else {
      await prisma.paymentAllocation.deleteMany({ where: { paymentId: payment.id } });
      await prisma.payment.delete({ where: { id: payment.id } });
    }

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PAYMENT_DELETED',
      entityType: 'Payment',
      entityId: payment.id,
      beforeJson: payment,
      afterJson: null,
    });

    return successResponse({ message: 'Payment record deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete payment', 500);
  }
}
