import { NextRequest } from 'next/server';
import { addDays } from 'date-fns';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';
import { resolveLineTax } from '@/lib/tax';
import { evaluateEligibleDiscount } from '@/lib/discounts';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) return errorResponse('Unauthorized', 401);

  if (authUser.role === 'CUSTOMER') {
    if (!authUser.customerAccountId) return errorResponse('Customer profile not found', 404);
    const quotations = await prisma.quotation.findMany({
      where: { customerId: authUser.customerAccountId },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse({ quotations });
  }

  const quotations = await prisma.quotation.findMany({
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ quotations });
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser || !hasRole(authUser, ['ADMIN', 'STAFF'])) {
      return errorResponse('Forbidden: Only staff and admin can generate quotations', 403);
    }

    const body = await req.json();
    let { customerId, planId, templateId, validityDays, discountCode, lines = [], notes } = body;

    // PRD Scene 3: Start from quotation template with prefilled plan, validity days, and product lines
    if (templateId) {
      const template = await prisma.quotationTemplate.findUnique({
        where: { id: templateId },
        include: { lines: true },
      });
      if (template) {
        if (!planId) planId = template.planId;
        if (!validityDays) validityDays = template.validityDays;
        if (lines.length === 0 && template.lines.length > 0) {
          lines = template.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          }));
        }
      }
    }

    if (!validityDays) validityDays = 30;

    if (!customerId || !planId || lines.length === 0) {
      return errorResponse('Customer, plan, and at least one line item are required', 400);
    }

    const customer = await prisma.customerAccount.findUnique({ where: { id: customerId } });
    if (!customer) return errorResponse('Customer not found', 404);

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || plan.status !== 'ACTIVE') return errorResponse('Plan is inactive or not found', 400);

    let subtotal = 0;
    let totalQty = 0;
    const productIds: string[] = [];
    const calculatedLines = [];

    for (const line of lines) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
        include: { variants: true },
      });
      if (!product) continue;

      let unitPrice = product.salesPrice;
      let variantName = '';

      if (line.variantId) {
        const variant = product.variants.find((v) => v.id === line.variantId);
        if (variant) {
          unitPrice += variant.priceDelta; // e.g. base 1200 + 560 = 1760
          variantName = ` (${variant.attributeValue})`;
        }
      }

      const qty = Number(line.quantity) || 1;
      const lineSubtotal = Number((unitPrice * qty).toFixed(2));
      subtotal += lineSubtotal;
      totalQty += qty;
      productIds.push(product.id);

      calculatedLines.push({
        productId: product.id,
        variantId: line.variantId || null,
        descriptionSnapshot: `${product.name}${variantName}`,
        quantity: qty,
        unitPrice,
        taxRuleId: line.taxRuleId || null,
        lineSubtotal,
      });
    }

    // Minimum quantity enforcement per PRD 5.2
    if (totalQty < plan.minQuantity) {
      return errorResponse(`Plan requires minimum quantity of ${plan.minQuantity} unit(s).`, 400);
    }

    const discountRes = await evaluateEligibleDiscount({
      subtotal,
      totalQuantity: totalQty,
      productIds,
      requestedCode: discountCode,
    });

    const discountRatio = subtotal > 0 ? discountRes.discountTotal / subtotal : 0;
    let taxTotal = 0;
    const finalLines = [];

    for (const line of calculatedLines) {
      const lineDiscount = Number((line.lineSubtotal * discountRatio).toFixed(2));
      const amountAfterDiscount = Math.max(0, line.lineSubtotal - lineDiscount);

      const taxRes = await resolveLineTax(amountAfterDiscount, line.taxRuleId);
      taxTotal += taxRes.taxAmount;

      finalLines.push({
        productId: line.productId,
        variantId: line.variantId,
        descriptionSnapshot: line.descriptionSnapshot,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: taxRes.taxRate,
        taxAmount: taxRes.taxAmount,
        lineTotal: Number((amountAfterDiscount + taxRes.taxAmount).toFixed(2)),
      });
    }

    const total = Number((subtotal - discountRes.discountTotal + taxTotal).toFixed(2));
    const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiryDate = addDays(new Date(), Number(validityDays) || 30);

    const quotation = await prisma.quotation.create({
      data: {
        quoteNumber,
        customerId,
        templateId: templateId || null,
        planId,
        status: 'SENT',
        issueDate: new Date(),
        expiryDate,
        subtotal: Number(subtotal.toFixed(2)),
        discountTotal: discountRes.discountTotal,
        taxTotal: Number(taxTotal.toFixed(2)),
        total,
        notes: notes || null,
        lines: {
          create: finalLines,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    return successResponse({ quotation }, 201);
  } catch (err: any) {
    return errorResponse(err.message || 'Failed to create quotation', 500);
  }
}
