import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      subscription: { include: { plan: true } },
      lines: true,
      allocations: {
        include: { payment: true },
      },
    },
  });

  if (!invoice) return errorResponse('Invoice not found', 404);

  // Customer isolation (AT-04)
  if (authUser.role === 'CUSTOMER' && invoice.customerId !== authUser.customerAccountId) {
    return errorResponse('Forbidden: You do not have access to this invoice', 403);
  }

  return successResponse({ invoice });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'STAFF')) {
      return errorResponse('Forbidden: Only admin/staff can update invoices', 403);
    }

    const body = await req.json();
    const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Invoice not found', 404);

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        notes: body.notes !== undefined ? body.notes : undefined,
        dueAt: body.dueAt !== undefined ? new Date(body.dueAt) : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
      include: { lines: true, customer: true },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'INVOICE_UPDATED',
      entityType: 'Invoice',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ invoice: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update invoice', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete invoices', 403);
    }

    const existing = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { allocations: true },
    });

    if (!existing) return errorResponse('Invoice not found', 404);

    if (existing.allocations.length > 0 || existing.amountPaid > 0) {
      return errorResponse('Cannot delete invoice with recorded payments. Void payment allocations first.', 400);
    }

    await prisma.invoiceLine.deleteMany({ where: { invoiceId: params.id } });

    const deleted = await prisma.invoice.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'INVOICE_DELETED',
      entityType: 'Invoice',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Invoice deleted successfully', invoice: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete invoice', 500);
  }
}
