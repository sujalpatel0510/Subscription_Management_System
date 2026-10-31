export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole, normalizeEmail, hashPassword, validatePasswordPolicy } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  // If customer, strictly return ONLY their own customer account per PRD AT-04
  if (authUser.role === 'CUSTOMER') {
    if (!authUser.customerAccountId) return errorResponse('Customer profile not found', 404);
    const customer = await prisma.customerAccount.findUnique({
      where: { id: authUser.customerAccountId },
      include: {
        subscriptions: { include: { plan: true } },
        invoices: true,
      },
    });
    return successResponse({ customers: customer ? [customer] : [] });
  }

  // Staff and Admin see all
  const customers = await prisma.customerAccount.findMany({
    include: {
      subscriptions: { include: { plan: true } },
      invoices: true,
      user: { select: { id: true, emailNormalized: true, role: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ customers });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
      return errorResponse('Forbidden: Insufficient privileges', 403);
    }

    const body = await req.json();
    const legalName = body.legalName || body.name || body.companyName;
    const rawEmail = body.billingEmail || body.email;
    const { taxId, billingAddress, currency = 'USD', timezone = 'UTC', password } = body;

    if (!legalName || !rawEmail) {
      return errorResponse('Legal business name and billing email are required', 400);
    }

    const billingEmail = normalizeEmail(rawEmail);

    let createdUserId: string | null = null;

    // If password provided, create corresponding login User account
    if (password) {
      const passCheck = validatePasswordPolicy(password);
      if (!passCheck.valid) {
        return errorResponse(passCheck.message || 'Password does not meet requirements', 400);
      }

      const existingUser = await prisma.user.findUnique({ where: { emailNormalized: billingEmail } });
      if (existingUser) {
        return errorResponse('A user account with this email already exists.', 409);
      }

      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          emailNormalized: billingEmail,
          passwordHash,
          name: legalName,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      });
      createdUserId = user.id;
    }

    const customer = await prisma.customerAccount.create({
      data: {
        userId: createdUserId,
        legalName,
        billingEmail,
        taxId: taxId || null,
        billingAddress: billingAddress || null,
        currency,
        timezone,
      },
      include: {
        user: true,
      },
    });

    return successResponse({ customer }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create customer', 500);
  }
}
