export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const quotation = await prisma.quotation.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      lines: true,
      template: true,
      plan: true,
      subscriptions: true,
    },
  });

  if (!quotation) return errorResponse('Quotation not found', 404);

  // Customer isolation
  if (authUser.role === 'CUSTOMER' && quotation.customerId !== authUser.customerAccountId) {
    return errorResponse('Forbidden: You cannot view another customer quotation', 403);
  }

  return successResponse({ quotation });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'STAFF')) {
      return errorResponse('Forbidden: Only staff/admin can edit quotations', 403);
    }

    const body = await req.json();
    const existing = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!existing) return errorResponse('Quotation not found', 404);

    const updated = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        status: body.status !== undefined ? body.status : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        expiryDate: body.expiryDate !== undefined ? new Date(body.expiryDate) : undefined,
        total: body.total !== undefined ? Number(body.total) : undefined,
        subtotal: body.subtotal !== undefined ? Number(body.subtotal) : undefined,
      },
      include: { customer: true, lines: true },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'QUOTATION_UPDATED',
      entityType: 'Quotation',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ quotation: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update quotation', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'STAFF')) {
      return errorResponse('Forbidden: Only staff/admin can delete quotations', 403);
    }

    const existing = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: { subscriptions: true },
    });

    if (!existing) return errorResponse('Quotation not found', 404);

    if (existing.subscriptions.length > 0) {
      // Disassociate or mark cancelled
      const cancelled = await prisma.quotation.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });
      return successResponse({
        message: 'Quotation has generated subscriptions. It has been marked as CANCELLED.',
        quotation: cancelled,
      });
    }

    await prisma.quotationLine.deleteMany({
      where: { quotationId: params.id },
    });

    const deleted = await prisma.quotation.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'QUOTATION_DELETED',
      entityType: 'Quotation',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Quotation deleted successfully', quotation: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete quotation', 500);
  }
}
