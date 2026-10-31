import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

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
    },
  });

  if (!customer) return errorResponse('Customer not found', 404);

  return successResponse({ customer });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== params.id) {
    return errorResponse('Forbidden: You cannot modify another customer account', 403);
  }

  const body = await req.json();
  const updated = await prisma.customerAccount.update({
    where: { id: params.id },
    data: {
      legalName: body.legalName,
      billingAddress: body.billingAddress,
      taxId: body.taxId,
      timezone: body.timezone,
    },
  });

  return successResponse({ customer: updated });
}
