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
      return errorResponse('Cancellation reason is required.', 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) return errorResponse('Invoice not found', 404);
    if (invoice.status === 'PAID') {
      return errorResponse('Cannot cancel an invoice that is already fully paid.', 400);
    }
    if (invoice.status === 'CANCELLED') {
      return errorResponse('Invoice is already cancelled.', 400);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'CANCELLED',
        notes: invoice.notes ? `${invoice.notes} | Cancelled: ${reason}` : `Cancelled: ${reason}`,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'INVOICE_CANCELLED',
      entityType: 'Invoice',
      entityId: invoice.id,
      beforeJson: { status: invoice.status },
      afterJson: { status: 'CANCELLED', reason },
    });

    return successResponse({ message: 'Invoice cancelled.', invoice: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to cancel invoice', 500);
  }
}
