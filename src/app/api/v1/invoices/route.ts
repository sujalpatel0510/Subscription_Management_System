export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');
  const customerIdFilter = searchParams.get('customerId');

  // Customer isolation (AT-04)
  if (authUser.role === 'CUSTOMER') {
    if (!authUser.customerAccountId) return errorResponse('Customer profile not found', 404);
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId: authUser.customerAccountId,
        status: statusFilter ? statusFilter.toUpperCase() : undefined,
      },
      include: {
        customer: true,
        subscription: true,
        lines: true,
        allocations: true,
      },
      orderBy: { issuedAt: 'desc' },
    });

    const enriched = invoices.map((inv) => {
      const balance = Number((inv.grandTotal - inv.amountPaid).toFixed(2));
      const isOverdue = inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueAt) < new Date() && balance > 0;
      return {
        ...inv,
        outstandingBalance: balance,
        isOverdue,
      };
    });

    return successResponse({ invoices: enriched });
  }

  // Admin & Staff
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId: customerIdFilter || undefined,
      status: statusFilter ? statusFilter.toUpperCase() : undefined,
    },
    include: {
      customer: true,
      subscription: true,
      lines: true,
      allocations: true,
    },
    orderBy: { issuedAt: 'desc' },
  });

  const enriched = invoices.map((inv) => {
    const balance = Number((inv.grandTotal - inv.amountPaid).toFixed(2));
    const isOverdue = inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueAt) < new Date() && balance > 0;
    return {
      ...inv,
      outstandingBalance: balance,
      isOverdue,
    };
  });

  return successResponse({ invoices: enriched });
}
