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

  // Customer record isolation check (PRD AT-04)
  if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== params.id) {
    return errorResponse('Forbidden: You do not have access to this customer account', 403);
  }

  const customer = await prisma.customerAccount.findUnique({
    where: { id: params.id },
    include: {
      subscriptions: {
        include: { plan: true, items: true },
      },
      invoices: {
        include: { lines: true, allocations: true },
      },
      quotations: true,
    },
  });

  if (!customer) return errorResponse('Customer not found', 404);

  return successResponse({ customer });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) return errorResponse('Unauthorized', 401);

    if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== params.id) {
      return errorResponse('Forbidden: You cannot modify another customer account', 403);
    }

    const body = await req.json();
    const existing = await prisma.customerAccount.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Customer not found', 404);

    const updated = await prisma.customerAccount.update({
      where: { id: params.id },
      data: {
        legalName: body.legalName !== undefined ? body.legalName : undefined,
        billingEmail: body.billingEmail !== undefined ? body.billingEmail : undefined,
        billingAddress: body.billingAddress !== undefined ? body.billingAddress : undefined,
        taxId: body.taxId !== undefined ? body.taxId : undefined,
        timezone: body.timezone !== undefined ? body.timezone : undefined,
        currency: body.currency !== undefined ? body.currency : undefined,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'CUSTOMER_UPDATED',
      entityType: 'CustomerAccount',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ customer: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update customer', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete customer accounts', 403);
    }

    const existing = await prisma.customerAccount.findUnique({
      where: { id: params.id },
      include: {
        subscriptions: true,
        invoices: true,
        quotations: true,
      },
    });

    if (!existing) return errorResponse('Customer not found', 404);

    // If customer has invoices or active subscriptions, soft-handle or check
    if (existing.invoices.length > 0 || existing.subscriptions.length > 0) {
      return errorResponse(
        'Cannot delete customer with existing invoices or subscriptions. Archive or close subscriptions first.',
        400
      );
    }

    // Delete quotations first if any
    await prisma.quotation.deleteMany({
      where: { customerId: params.id },
    });

    const deleted = await prisma.customerAccount.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'CUSTOMER_DELETED',
      entityType: 'CustomerAccount',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Customer account deleted successfully', customer: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete customer', 500);
  }
}
