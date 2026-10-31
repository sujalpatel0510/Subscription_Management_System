import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taxRule = await prisma.taxRate.findUnique({
    where: { id: params.id },
  });

  if (!taxRule) return errorResponse('Tax rule not found', 404);
  return successResponse({ taxRule });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can configure tax rules', 403);
    }

    const body = await req.json();
    const existing = await prisma.taxRate.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Tax rule not found', 404);

    const updated = await prisma.taxRate.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        rate: body.rate !== undefined ? Number(body.rate) : undefined,
        calculationType: body.calculationType !== undefined ? body.calculationType : undefined,
        jurisdiction: body.jurisdiction !== undefined ? body.jurisdiction : undefined,
        active: body.active !== undefined ? Boolean(body.active) : undefined,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'TAX_RULE_UPDATED',
      entityType: 'TaxRate',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ taxRule: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update tax rule', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete tax rules', 403);
    }

    const existing = await prisma.taxRate.findUnique({ where: { id: params.id } });
    if (!existing) return errorResponse('Tax rule not found', 404);

    const deleted = await prisma.taxRate.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'TAX_RULE_DELETED',
      entityType: 'TaxRate',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Tax rule deleted successfully', taxRule: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete tax rule', 500);
  }
}
