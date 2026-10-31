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

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) return errorResponse('Invoice not found', 404);
    if (invoice.status !== 'DRAFT') {
      return errorResponse(`Invoice cannot be confirmed from status ${invoice.status}`, 400);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'CONFIRMED' },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'INVOICE_CONFIRMED',
      entityType: 'Invoice',
      entityId: invoice.id,
      beforeJson: { status: 'DRAFT' },
      afterJson: { status: 'CONFIRMED' },
    });

    return successResponse({ message: 'Invoice confirmed.', invoice: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to confirm invoice', 500);
  }
}
