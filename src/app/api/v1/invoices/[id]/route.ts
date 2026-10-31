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

  // Customer record isolation check (AT-04)
  if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== invoice.customerId) {
    return errorResponse('Forbidden: You do not have access to this invoice', 403);
  }

  const balance = Number((invoice.grandTotal - invoice.amountPaid).toFixed(2));
  const isOverdue = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && new Date(invoice.dueAt) < new Date() && balance > 0;

  return successResponse({
    invoice: {
      ...invoice,
      outstandingBalance: balance,
      isOverdue,
    },
  });
}
