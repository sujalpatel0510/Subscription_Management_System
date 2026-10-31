export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  if (authUser.role === 'CUSTOMER') {
    return successResponse({ templates: [] });
  }

  const templates = await prisma.quotationTemplate.findMany({
    include: {
      plan: true,
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ templates });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return errorResponse('Forbidden: Only admin can create quotation templates', 403);
    }

    const { name, planId, validityDays = 30, lines = [] } = await req.json();
    if (!name) return errorResponse('Template name is required', 400);

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        planId: planId || null,
        validityDays: Number(validityDays) || 30,
        status: 'ACTIVE',
        lines: lines.length > 0 ? {
          create: lines.map((l: any) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: Number(l.quantity) || 1,
            unitPrice: Number(l.unitPrice),
          })),
        } : undefined,
      },
      include: {
        plan: true,
        lines: true,
      },
    });

    return successResponse({ template }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create quotation template', 500);
  }
}
