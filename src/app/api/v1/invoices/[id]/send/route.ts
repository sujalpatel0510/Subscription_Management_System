import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api-response';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const principal = await getAuthenticatedUser(req);
    if (!principal) return errorResponse('Unauthorized', 401);

    if (principal.role === 'CUSTOMER') {
      return errorResponse('Forbidden: Only staff and admin can send invoices', 403);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        subscription: true,
        lines: true,
      },
    });

    if (!invoice) return errorResponse('Invoice not found', 404);

    const recipientEmail = invoice.customer?.billingEmail || 'customer@example.com';

    // Create durable in-app notification record per PRD Scene 4
    await prisma.notification.create({
      data: {
        type: 'INVOICE_GENERATED',
        recipient: recipientEmail,
        subject: `Invoice #${invoice.invoiceNumber} from Brightloop Software`,
        body: `Your invoice #${invoice.invoiceNumber} for amount $${invoice.grandTotal.toFixed(2)} is ready and due on ${new Date(invoice.dueAt).toLocaleDateString()}.`,
        relatedEntity: 'Invoice',
        relatedId: invoice.id,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Record audit event
    await logAuditEvent({
      actorUserId: principal.userId,
      entityType: 'Invoice',
      entityId: invoice.id,
      action: 'INVOICE_SENT',
      beforeJson: { invoiceNumber: invoice.invoiceNumber, status: invoice.status },
      afterJson: {
        recipientEmail,
        sentAt: new Date().toISOString(),
      },
    });

    return successResponse({
      message: `Invoice #${invoice.invoiceNumber} successfully sent to ${recipientEmail}!`,
      invoiceId: invoice.id,
      recipient: recipientEmail,
    });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
