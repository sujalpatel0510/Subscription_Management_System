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
  const isInternal = authUser && (authUser.role === 'ADMIN' || authUser.role === 'STAFF');

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true },
  });

  if (!product) return errorResponse('Product not found', 404);

  if (!isInternal) {
    const { costPrice, ...rest } = product;
    return successResponse({ product: rest });
  }

  return successResponse({ product });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can modify products', 403);
    }

    const body = await req.json();
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });
    if (!existing) return errorResponse('Product not found', 404);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        type: body.type !== undefined ? body.type : undefined,
        salesPrice: body.salesPrice !== undefined ? Number(body.salesPrice) : undefined,
        costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
      include: { variants: true },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: updated.id,
      beforeJson: existing,
      afterJson: updated,
    });

    return successResponse({ product: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to update product', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can delete products', 403);
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    });

    if (!existing) return errorResponse('Product not found', 404);

    // Delete variants first, then product
    await prisma.productVariant.deleteMany({
      where: { productId: params.id },
    });

    await prisma.discountEligibility.deleteMany({
      where: { productId: params.id },
    });

    const deleted = await prisma.product.delete({
      where: { id: params.id },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: deleted.id,
      beforeJson: existing,
      afterJson: null,
    });

    return successResponse({ message: 'Product deleted successfully', product: deleted });
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to delete product', 500);
  }
}
