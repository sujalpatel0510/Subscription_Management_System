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

  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      plan: true,
      items: true,
      events: { orderBy: { createdAt: 'desc' } },
      invoices: {
        include: { lines: true, allocations: true },
        orderBy: { issuedAt: 'desc' },
      },
    },
  });

  if (!subscription) return errorResponse('Subscription not found', 404);

  // Customer isolation (AT-04)
  if (authUser.role === 'CUSTOMER' && authUser.customerAccountId !== subscription.customerId) {
    return errorResponse('Forbidden: You do not have access to this subscription', 403);
  }

  return successResponse({ subscription });
}
