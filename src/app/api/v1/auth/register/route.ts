import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeEmail, validatePasswordPolicy, hashPassword, signAuthToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, billingAddress, currency = 'USD' } = body;
    const legalName = body.legalName || body.name || body.companyName;

    if (!email || !password || !legalName) {
      return errorResponse('Email, password, and business legal name are required.', 400);
    }

    const emailNormalized = normalizeEmail(email);

    // Password policy validation
    const passCheck = validatePasswordPolicy(password);
    if (!passCheck.valid) {
      return errorResponse(passCheck.message || 'Password does not meet security requirements.', 400);
    }

    // Duplicate check
    const existing = await prisma.user.findUnique({
      where: { emailNormalized },
    });

    if (existing) {
      return errorResponse('An account with this email address already exists.', 409);
    }

    const passwordHash = await hashPassword(password);

    // Public self-registration only allows CUSTOMER role
    const user = await prisma.user.create({
      data: {
        emailNormalized,
        passwordHash,
        name: legalName,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        customerAccount: {
          create: {
            legalName,
            billingEmail: emailNormalized,
            billingAddress: billingAddress || '',
            currency,
          },
        },
      },
      include: {
        customerAccount: true,
      },
    });

    await prisma.notification.create({
      data: {
        type: 'WELCOME',
        recipient: emailNormalized,
        subject: 'Welcome to Brightloop Software',
        body: `Welcome ${legalName}! Your customer self-service portal is active.`,
        relatedEntity: 'User',
        relatedId: user.id,
      },
    });

    await logAuditEvent({
      actorUserId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      afterJson: { email: emailNormalized, role: 'CUSTOMER' },
    });

    const token = signAuthToken({
      userId: user.id,
      email: user.emailNormalized,
      role: 'CUSTOMER',
      name: user.name,
      customerAccountId: user.customerAccount?.id ?? null,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.emailNormalized,
        role: user.role,
        name: user.name,
        customerAccountId: user.customerAccount?.id,
      },
      token,
    }, 201);

    response.cookies.set('bl_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(error.message || 'Failed to register account.', 500);
  }
}
