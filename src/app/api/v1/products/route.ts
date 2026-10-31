import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  const isInternal = authUser && (authUser.role === 'ADMIN' || authUser.role === 'STAFF');

  const products = await prisma.product.findMany({
    where: isInternal ? undefined : { status: 'ACTIVE' },
    include: {
      variants: true,
    },
    orderBy: { name: 'asc' },
  });

  // Strip costPrice if customer per PRD 5.2
  const sanitized = products.map((p) => {
    if (!isInternal) {
      const { costPrice, ...rest } = p;
      return rest;
    }
    return p;
  });

  return successResponse({ products: sanitized });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admins can configure products', 403);
    }

    const body = await req.json();
    const { name, type = 'Software', salesPrice, costPrice = 0, notes, variants } = body;

    if (!name || salesPrice === undefined) {
      return errorResponse('Product name and sales price are required', 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        salesPrice: Number(salesPrice),
        costPrice: Number(costPrice),
        notes: notes || null,
        status: 'ACTIVE',
        variants: variants && Array.isArray(variants) ? {
          create: variants.map((v: any) => ({
            attributeName: v.attributeName || 'Variant',
            attributeValue: v.attributeValue,
            priceDelta: Number(v.priceDelta || 0),
          })),
        } : undefined,
      },
      include: {
        variants: true,
      },
    });

    await logAuditEvent({
      actorUserId: authUser.userId,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      afterJson: product,
    });

    return successResponse({ product }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create product', 500);
  }
}
