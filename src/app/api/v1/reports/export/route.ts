import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { errorResponse } from '@/lib/api-response';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return errorResponse('Unauthorized: Please log in to export documents', 401);
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId');
    const isCustomer = authUser.role === 'CUSTOMER';
    const customerFilterId = isCustomer ? (authUser.customerAccountId || undefined) : undefined;
    const forceDownload = searchParams.get('download') === 'true';

    // =========================================================================
    // MODE 1: SINGLE INVOICE PDF EXPORT
    // =========================================================================
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          lines: true,
          allocations: { include: { payment: true } },
          subscription: { include: { plan: true } },
        },
      });

      if (!invoice) {
        return errorResponse('Invoice not found', 404);
      }

      // Customer isolation check (AT-04)
      if (isCustomer && invoice.customerId !== authUser.customerAccountId) {
        return errorResponse('Forbidden: You can only export your own invoices', 403);
      }

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Brand Header
      doc.setFillColor(30, 27, 75); // Midnight indigo
      doc.rect(0, 0, pageWidth, 90, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('BRIGHTLOOP SOFTWARE', 40, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(199, 210, 254);
      doc.text('Subscription Management & Recurring Billing Platform', 40, 58);
      doc.text('Tax ID: US-EIN-992014  |  billing@brightloop.io  |  https://brightloop.io', 40, 72);

      // Invoice Badge in Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('TAX INVOICE', pageWidth - 40, 42, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(129, 140, 248);
      doc.text(invoice.invoiceNumber, pageWidth - 40, 60, { align: 'right' });

      doc.setFontSize(9);
      doc.setTextColor(224, 231, 255);
      doc.text(`Status: ${invoice.status}`, pageWidth - 40, 74, { align: 'right' });

      // Customer & Billing Info Grid
      let y = 115;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text('BILLED TO (CUSTOMER DETAILS)', 40, y);
      doc.text('INVOICE & CONTRACT DETAILS', pageWidth / 2 + 20, y);

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(invoice.customer.legalName, 40, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(`Invoice Date: ${new Date(invoice.issuedAt).toLocaleDateString()}`, pageWidth / 2 + 20, y);

      y += 14;
      doc.text(`Email: ${invoice.customer.billingEmail}`, 40, y);
      doc.text(`Payment Due: ${new Date(invoice.dueAt).toLocaleDateString()}`, pageWidth / 2 + 20, y);

      y += 14;
      doc.text(`Tax / VAT ID: ${invoice.customer.taxId || 'N/A (Standard Commercial)'}`, 40, y);
      doc.text(`Billing Cadence: ${invoice.subscription?.plan?.intervalUnit || 'MONTHLY'}`, pageWidth / 2 + 20, y);

      y += 14;
      doc.text(`Address: ${invoice.customer.billingAddress || 'Commercial Account on File'}`, 40, y);
      doc.text(`Contract Period: ${new Date(invoice.periodStart).toLocaleDateString()} – ${new Date(invoice.periodEnd).toLocaleDateString()}`, pageWidth / 2 + 20, y);

      // Line Items Table
      const balance = Number((invoice.grandTotal - invoice.amountPaid).toFixed(2));
      const lineRows = invoice.lines.map((line: any, idx: number) => [
        (idx + 1).toString(),
        line.description || 'Subscription Line Item',
        line.quantity.toString(),
        `$${line.unitPrice.toFixed(2)}`,
        `$${(line.discountAmount || 0).toFixed(2)}`,
        `$${(line.taxAmount || 0).toFixed(2)}`,
        `$${line.lineTotal.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: y + 24,
        head: [['#', 'Item / Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Amount']],
        body: lineRows,
        theme: 'striped',
        headStyles: {
          fillColor: [49, 46, 129],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8.5, textColor: [31, 41, 55] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 40, halign: 'center' },
          3: { cellWidth: 65, halign: 'right' },
          4: { cellWidth: 60, halign: 'right' },
          5: { cellWidth: 50, halign: 'right' },
          6: { cellWidth: 70, halign: 'right' },
        },
        margin: { left: 40, right: 40 },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 18;

      // Summary Totals Box on Right
      const sumBoxX = pageWidth - 240;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(sumBoxX, finalY, 200, 110, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(sumBoxX, finalY, 200, 110, 4, 4, 'D');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', sumBoxX + 12, finalY + 20);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, sumBoxX + 188, finalY + 20, { align: 'right' });

      doc.text('Discounts Applied:', sumBoxX + 12, finalY + 36);
      doc.text(`-$${invoice.discountTotal.toFixed(2)}`, sumBoxX + 188, finalY + 36, { align: 'right' });

      doc.text('Calculated Taxes:', sumBoxX + 12, finalY + 52);
      doc.text(`+$${invoice.taxTotal.toFixed(2)}`, sumBoxX + 188, finalY + 52, { align: 'right' });

      doc.setDrawColor(203, 213, 225);
      doc.line(sumBoxX + 10, finalY + 62, sumBoxX + 190, finalY + 62);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Grand Total:', sumBoxX + 12, finalY + 78);
      doc.text(`$${invoice.grandTotal.toFixed(2)}`, sumBoxX + 188, finalY + 78, { align: 'right' });

      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105);
      doc.text('Amount Paid:', sumBoxX + 12, finalY + 92);
      doc.text(`$${invoice.amountPaid.toFixed(2)}`, sumBoxX + 188, finalY + 92, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(balance > 0 ? 225 : 15, balance > 0 ? 29 : 23, balance > 0 ? 72 : 42);
      doc.text('Remaining Balance:', sumBoxX + 12, finalY + 104);
      doc.text(`$${balance.toFixed(2)}`, sumBoxX + 188, finalY + 104, { align: 'right' });

      // Remittance / Payment Instructions on Left
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text('PAYMENT & REMITTANCE INSTRUCTIONS', 40, finalY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Beneficiary: Brightloop Software Corp.', 40, finalY + 35);
      doc.text('Bank Name: Silicon Valley Bank / First Commercial', 40, finalY + 48);
      doc.text('Routing Number: 121000358  |  Account: 9948201948', 40, finalY + 61);
      doc.text('Online Payment: Login to portal at https://brightloop.io to pay via credit card.', 40, finalY + 74);
      doc.text('Terms: Invoices payable within 30 days of period issuance.', 40, finalY + 87);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated by Brightloop Software Billing Engine • Enterprise Subscription Management', pageWidth / 2, 810, { align: 'center' });

      const pdfOutput = doc.output('arraybuffer');
      const filename = `${invoice.invoiceNumber}.pdf`;

      return new NextResponse(Buffer.from(pdfOutput), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `${forceDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
        },
      });
    }

    // =========================================================================
    // MODE 2: COMPREHENSIVE FINANCIAL & OPERATIONAL AUDIT PDF REPORT
    // =========================================================================
    const [subscriptions, invoices, payments] = await Promise.all([
      prisma.subscription.findMany({
        where: customerFilterId ? { customerId: customerFilterId } : undefined,
        include: { customer: true, plan: true, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.findMany({
        where: customerFilterId ? { customerId: customerFilterId } : undefined,
        include: { customer: true, lines: true, allocations: true, subscription: { include: { plan: true } } },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: customerFilterId ? {
          allocations: { some: { invoice: { customerId: customerFilterId } } },
        } : undefined,
        include: {
          allocations: { include: { invoice: { include: { customer: true } } } },
          createdBy: true,
        },
        orderBy: { paidAt: 'desc' },
      }),
    ]);

    // Financial Metrics Calculation
    let mrr = 0;
    const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
    for (const sub of activeSubs) {
      const lineTotal = sub.items.reduce((acc, i) => acc + i.amount, 0);
      const unit = sub.plan.intervalUnit.toUpperCase();
      if (unit === 'MONTHLY') mrr += lineTotal;
      else if (unit === 'YEARLY') mrr += lineTotal / 12;
      else if (unit === 'WEEKLY') mrr += (lineTotal * 52) / 12;
      else if (unit === 'DAILY') mrr += lineTotal * 30;
    }
    const arr = Number((mrr * 12).toFixed(2));
    mrr = Number(mrr.toFixed(2));

    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const totalCashPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const now = new Date();
    const overdueInvoices = invoices.filter(
      (inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && new Date(inv.dueAt) < now && (inv.grandTotal - inv.amountPaid) > 0
    );
    const overdueTotal = overdueInvoices.reduce((acc, inv) => acc + (inv.grandTotal - inv.amountPaid), 0);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cover / Header Banner
    doc.setFillColor(30, 27, 75); // Deep Midnight
    doc.rect(0, 0, pageWidth, 80, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('BRIGHTLOOP SOFTWARE', 40, 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(199, 210, 254);
    doc.text('Detailed Subscription Lifecycle, Recurring Billing & Financial Audit Report', 40, 52);
    doc.text(`Generated: ${new Date().toLocaleString()}  |  Actor: ${authUser.email} (${authUser.role})`, 40, 66);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(isCustomer ? 'CUSTOMER STATEMENT' : 'EXECUTIVE AUDIT REPORT', pageWidth - 40, 36, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(129, 140, 248);
    doc.text('Database-First Verification', pageWidth - 40, 52, { align: 'right' });

    // KPI Cards Matrix Row
    let y = 95;
    const cardWidth = (pageWidth - 80 - 45) / 4;
    const cards = [
      { label: 'MONTHLY RECURRING (MRR)', value: `$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `ARR: $${arr.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
      { label: 'ACTIVE CONTRACTS', value: `${activeSubs.length} active`, sub: `Total Subscriptions: ${subscriptions.length}` },
      { label: 'CASH REALIZED', value: `$${totalCashPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `Total Billed: $${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
      { label: 'OVERDUE BALANCE', value: `$${overdueTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, sub: `${overdueInvoices.length} past-due invoices` },
    ];

    cards.forEach((c, idx) => {
      const x = 40 + idx * (cardWidth + 15);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, cardWidth, 54, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, cardWidth, 54, 4, 4, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, x + 10, y + 16);

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(c.value, x + 10, y + 34);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.sub, x + 10, y + 46);
    });

    y += 72;

    // SECTION 1: DETAILED INVOICES TABLE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 27, 75);
    doc.text('1. Detailed Invoices & Billing Schedule', 40, y);

    const invoiceTableData = invoices.map((inv) => {
      const bal = Number((inv.grandTotal - inv.amountPaid).toFixed(2));
      return [
        inv.invoiceNumber,
        inv.customer.legalName,
        `${new Date(inv.periodStart).toLocaleDateString()} - ${new Date(inv.periodEnd).toLocaleDateString()}`,
        new Date(inv.dueAt).toLocaleDateString(),
        inv.status,
        `$${inv.subtotal.toFixed(2)}`,
        `$${inv.discountTotal.toFixed(2)}`,
        `$${inv.taxTotal.toFixed(2)}`,
        `$${inv.grandTotal.toFixed(2)}`,
        `$${inv.amountPaid.toFixed(2)}`,
        `$${bal.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: y + 8,
      head: [['Invoice #', 'Customer', 'Period', 'Due Date', 'Status', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Paid', 'Balance']],
      body: invoiceTableData,
      theme: 'grid',
      headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [31, 41, 55] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 100 },
        3: { cellWidth: 60 },
        4: { cellWidth: 65, halign: 'center' },
        5: { cellWidth: 55, halign: 'right' },
        6: { cellWidth: 50, halign: 'right' },
        7: { cellWidth: 45, halign: 'right' },
        8: { cellWidth: 65, halign: 'right' },
        9: { cellWidth: 55, halign: 'right' },
        10: { cellWidth: 60, halign: 'right' },
      },
      margin: { left: 40, right: 40 },
    });

    // SECTION 2: SUBSCRIPTIONS SCHEDULE
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 27, 75);
    doc.text('2. Subscriptions & Contract Lifecycles', 40, 40);

    const subTableData = subscriptions.map((s) => [
      s.subscriptionNumber,
      s.customer.legalName,
      s.plan.name,
      s.plan.intervalUnit,
      s.status,
      new Date(s.startDate).toLocaleDateString(),
      new Date(s.expiryDate).toLocaleDateString(),
      s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : '—',
      s.paymentTerms,
      s.items.length.toString(),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Subscription #', 'Customer', 'Plan', 'Cadence', 'Status', 'Start Date', 'Expiry Date', 'Next Billing', 'Terms', 'Lines']],
      body: subTableData,
      theme: 'grid',
      headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [31, 41, 55] },
      margin: { left: 40, right: 40 },
    });

    // SECTION 3: PAYMENTS RECONCILIATION
    const subFinalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 27, 75);
    doc.text('3. Payments & Cash Settlement History', 40, subFinalY);

    const paymentTableData = payments.map((p) => {
      const inv = p.allocations[0]?.invoice;
      return [
        p.paymentNumber,
        inv?.invoiceNumber || '—',
        inv?.customer?.legalName || 'Direct',
        p.method,
        `$${p.amount.toFixed(2)}`,
        p.currency,
        new Date(p.paidAt).toLocaleDateString(),
        p.status,
        p.reference || '—',
      ];
    });

    autoTable(doc, {
      startY: subFinalY + 10,
      head: [['Payment #', 'Target Invoice #', 'Customer', 'Method', 'Amount', 'Currency', 'Paid Date', 'Status', 'Reference']],
      body: paymentTableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [31, 41, 55] },
      margin: { left: 40, right: 40 },
    });

    // Page numbering on all pages
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Brightloop Software Financial Report • Page ${i} of ${pageCount}`, pageWidth / 2, 570, { align: 'center' });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const filename = isCustomer
      ? 'Brightloop_Customer_Statement.pdf'
      : 'Brightloop_Detailed_Financial_Report.pdf';

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${forceDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('PDF export generation error:', err);
    return errorResponse(err.message || 'Failed to generate PDF export', 500);
  }
}
