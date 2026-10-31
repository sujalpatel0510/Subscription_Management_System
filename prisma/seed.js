const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Brightloop Subscription Management System (PRD Section 7 & 12)...');

  // Clean in relational order
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.billingRun.deleteMany();
  await prisma.subscriptionEvent.deleteMany();
  await prisma.subscriptionItem.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.quotationTemplateLine.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.discountEligibility.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRate.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.customerAccount.deleteMany();
  await prisma.staffInvite.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('BrightLoop#2026', 12);
  const staffPass = await bcrypt.hash('BrightStaff#2026', 12);
  const custPass = await bcrypt.hash('Customer#2026', 12);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      emailNormalized: 'admin@brightloop.io',
      name: 'System Admin',
      passwordHash: adminPass,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const staff = await prisma.user.create({
    data: {
      emailNormalized: 'staff@brightloop.io',
      name: 'Sarah Connor (Staff Operations)',
      passwordHash: staffPass,
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });

  const custUser1 = await prisma.user.create({
    data: {
      emailNormalized: 'john@acme.com',
      name: 'John Doe',
      passwordHash: custPass,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  const custUser2 = await prisma.user.create({
    data: {
      emailNormalized: 'alice@globex.com',
      name: 'Alice Smith',
      passwordHash: custPass,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // 2. Customer Accounts
  const acme = await prisma.customerAccount.create({
    data: {
      userId: custUser1.id,
      legalName: 'Acme Corporation Ltd',
      billingEmail: 'john@acme.com',
      taxId: 'US-TAX-889921',
      billingAddress: '100 Broadway, New York, NY 10005, USA',
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  const globex = await prisma.customerAccount.create({
    data: {
      userId: custUser2.id,
      legalName: 'Globex Industries Inc',
      billingEmail: 'alice@globex.com',
      taxId: 'GB-VAT-445566',
      billingAddress: '42 Baker Street, London, W1U 7DL, UK',
      currency: 'USD',
      timezone: 'Europe/London',
    },
  });

  const nexus = await prisma.customerAccount.create({
    data: {
      legalName: 'Nexus Tech Innovations',
      billingEmail: 'billing@nexustech.org',
      taxId: 'IN-GST-27AAAAA0000A1Z5',
      billingAddress: 'Sector 5, Bangalore, Karnataka, India',
      currency: 'USD',
      timezone: 'Asia/Kolkata',
    },
  });

  // 3. Products & Variants (with Odoo +560 variant delta from Problem Statement)
  const crm = await prisma.product.create({
    data: {
      name: 'Brightloop CRM',
      type: 'Software',
      salesPrice: 1200.0,
      costPrice: 350.0,
      notes: 'Customer relationship management and sales pipeline engine.',
      status: 'ACTIVE',
    },
  });

  const crmStandard = await prisma.productVariant.create({
    data: {
      productId: crm.id,
      attributeName: 'Brand/Edition',
      attributeValue: 'Standard Cloud Edition',
      priceDelta: 0.0,
    },
  });

  const crmOdoo = await prisma.productVariant.create({
    data: {
      productId: crm.id,
      attributeName: 'Brand/Edition',
      attributeValue: 'Odoo Connected Edition',
      priceDelta: 560.0, // Problem statement explicit requirement: Odoo adds 560!
    },
  });

  const erp = await prisma.product.create({
    data: {
      name: 'Brightloop ERP Cloud',
      type: 'Software',
      salesPrice: 2400.0,
      costPrice: 700.0,
      notes: 'Full ERP with ledger, supply chain and invoicing.',
      status: 'ACTIVE',
    },
  });

  const aiAddon = await prisma.product.create({
    data: {
      name: 'AI Analytics & Forecasting Add-On',
      type: 'Add-on',
      salesPrice: 350.0,
      costPrice: 50.0,
      notes: 'Automated churn prediction and revenue forecasting.',
      status: 'ACTIVE',
    },
  });

  // 4. Plans (PRD 5.2)
  const monthlyStarter = await prisma.plan.create({
    data: {
      name: 'Monthly Starter',
      price: 150.0,
      intervalUnit: 'MONTHLY',
      intervalCount: 1,
      minQuantity: 1,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true,
      status: 'ACTIVE',
    },
  });

  const annualEnterprise = await prisma.plan.create({
    data: {
      name: 'Annual Enterprise',
      price: 1500.0,
      intervalUnit: 'YEARLY',
      intervalCount: 1,
      minQuantity: 1,
      autoClose: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenew: true,
      status: 'ACTIVE',
    },
  });

  const weeklySprint = await prisma.plan.create({
    data: {
      name: 'FastTrack Weekly Sprint',
      price: 60.0,
      intervalUnit: 'WEEKLY',
      intervalCount: 1,
      minQuantity: 1,
      autoClose: true,
      allowEarlyClose: true,
      allowPause: false, // Disallow pause per plan policy
      allowRenew: false, // Disallow renewal per plan policy
      status: 'ACTIVE',
    },
  });

  // 5. Taxes (PRD 5.5)
  const usTax = await prisma.taxRate.create({
    data: { name: 'US Sales Tax 8.25%', rate: 8.25, jurisdiction: 'US', active: true },
  });

  const vatTax = await prisma.taxRate.create({
    data: { name: 'VAT 20%', rate: 20.0, jurisdiction: 'EU/UK', active: true },
  });

  const gstTax = await prisma.taxRate.create({
    data: { name: 'GST 18%', rate: 18.0, jurisdiction: 'IN', active: true },
  });

  // 6. Discounts (PRD 5.5)
  const welcomeDisc = await prisma.discountRule.create({
    data: {
      code: 'WELCOME10',
      name: '10% Welcome Discount',
      type: 'PERCENTAGE',
      value: 10.0,
      minQuantity: 1,
      usageLimit: 100,
      usageCount: 2,
      scopeType: 'ALL',
      active: true,
    },
  });

  const enterpriseDisc = await prisma.discountRule.create({
    data: {
      code: 'ENTERPRISE300',
      name: '$300 Volume Contract Discount',
      type: 'FIXED',
      value: 300.0,
      minAmount: 1500.0,
      usageLimit: 25,
      usageCount: 1,
      scopeType: 'SUBSCRIPTIONS',
      active: true,
    },
  });

  // 7. Quotation Templates (PRD 5.3)
  const template = await prisma.quotationTemplate.create({
    data: {
      name: 'Brightloop Enterprise Suite Bundle',
      planId: annualEnterprise.id,
      validityDays: 30,
      status: 'ACTIVE',
      lines: {
        create: [
          {
            productId: crm.id,
            variantId: crmOdoo.id,
            quantity: 1,
            unitPrice: 1760.0, // 1200 + 560
          },
          {
            productId: aiAddon.id,
            quantity: 1,
            unitPrice: 350.0,
          },
        ],
      },
    },
  });

  // 8. Sample Quotation
  const quote = await prisma.quotation.create({
    data: {
      quoteNumber: 'QT-2026-1001',
      customerId: nexus.id,
      templateId: template.id,
      planId: annualEnterprise.id,
      status: 'SENT',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 2110.0,
      discountTotal: 211.0,
      taxTotal: 341.82,
      total: 2240.82,
      notes: 'Special offer with Odoo brand variant and AI analytics.',
      lines: {
        create: [
          {
            productId: crm.id,
            variantId: crmOdoo.id,
            descriptionSnapshot: 'Brightloop CRM - Odoo Connected Edition',
            quantity: 1,
            unitPrice: 1760.0,
            taxRate: 18.0,
            taxAmount: 285.12,
            lineTotal: 1869.12,
          },
          {
            productId: aiAddon.id,
            descriptionSnapshot: 'AI Analytics & Forecasting Add-On',
            quantity: 1,
            unitPrice: 350.0,
            taxRate: 18.0,
            taxAmount: 56.70,
            lineTotal: 371.70,
          },
        ],
      },
    },
  });

  // 9. Subscriptions
  // Subscription 1: Acme Corp - Annual Enterprise (Active)
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: acme.id,
      planId: annualEnterprise.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2027-01-01'),
      nextBillingDate: new Date('2026-11-01'),
      paymentTerms: 'Net 15',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenew: true,
      items: {
        create: [
          {
            productId: crm.id,
            variantId: crmOdoo.id,
            descriptionSnapshot: 'Brightloop CRM (Odoo Connected Edition)',
            quantity: 2,
            unitPrice: 1760.0,
            taxRuleId: usTax.id,
            taxRate: 8.25,
            amount: 3520.0,
          },
          {
            productId: aiAddon.id,
            descriptionSnapshot: 'AI Analytics & Forecasting Add-On',
            quantity: 1,
            unitPrice: 350.0,
            taxRuleId: usTax.id,
            taxRate: 8.25,
            amount: 350.0,
          },
        ],
      },
      events: {
        create: [
          {
            fromStatus: 'QUOTATION',
            toStatus: 'ACTIVE',
            changedBy: 'Sarah Connor',
            reason: 'Proposal confirmed and activated',
            createdAt: new Date('2026-01-01'),
          },
        ],
      },
    },
  });

  // Subscription 2: Globex Industries - Monthly Starter (Active)
  const sub2 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0002',
      customerId: globex.id,
      planId: monthlyStarter.id,
      status: 'ACTIVE',
      startDate: new Date('2026-06-01'),
      expiryDate: new Date('2027-06-01'),
      nextBillingDate: new Date('2026-11-01'),
      paymentTerms: 'Net 30',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenew: true,
      items: {
        create: [
          {
            productId: crm.id,
            variantId: crmStandard.id,
            descriptionSnapshot: 'Brightloop CRM - Standard Edition',
            quantity: 1,
            unitPrice: 1200.0,
            taxRuleId: vatTax.id,
            taxRate: 20.0,
            amount: 1200.0,
          },
        ],
      },
    },
  });

  // Subscription 3: Nexus Tech - Paused
  const sub3 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0003',
      customerId: nexus.id,
      planId: monthlyStarter.id,
      status: 'PAUSED',
      startDate: new Date('2026-03-01'),
      expiryDate: new Date('2027-03-01'),
      nextBillingDate: new Date('2026-12-01'),
      paymentTerms: 'Immediate',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenew: true,
      items: {
        create: [
          {
            productId: erp.id,
            descriptionSnapshot: 'Brightloop ERP Cloud',
            quantity: 1,
            unitPrice: 2400.0,
            taxRuleId: gstTax.id,
            taxRate: 18.0,
            amount: 2400.0,
          },
        ],
      },
      events: {
        create: [
          {
            fromStatus: 'ACTIVE',
            toStatus: 'PAUSED',
            changedBy: 'Admin',
            reason: 'Seasonal pause requested by customer',
            createdAt: new Date('2026-09-15'),
          },
        ],
      },
    },
  });

  // 10. Sample Invoices & Payments for Finance Dashboard
  // Invoice 1: Fully Paid Invoice (Acme)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00101',
      customerId: acme.id,
      subscriptionId: sub1.id,
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-04-01'),
      issuedAt: new Date('2026-01-01'),
      dueAt: new Date('2026-01-16'),
      status: 'PAID',
      currency: 'USD',
      subtotal: 3870.0,
      discountTotal: 300.0,
      discountRuleId: enterpriseDisc.id,
      taxTotal: 294.52,
      grandTotal: 3864.52,
      amountPaid: 3864.52,
      lines: {
        create: [
          {
            productId: crm.id,
            variantId: crmOdoo.id,
            descriptionSnapshot: 'Brightloop CRM (Odoo Connected Edition)',
            quantity: 2,
            unitPrice: 1760.0,
            discountAmount: 272.87,
            taxRate: 8.25,
            taxAmount: 267.89,
            lineTotal: 3515.02,
          },
          {
            productId: aiAddon.id,
            descriptionSnapshot: 'AI Analytics & Forecasting Add-On',
            quantity: 1,
            unitPrice: 350.0,
            discountAmount: 27.13,
            taxRate: 8.25,
            taxAmount: 26.63,
            lineTotal: 349.50,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0001',
      method: 'BANK_TRANSFER',
      amount: 3864.52,
      currency: 'USD',
      paidAt: new Date('2026-01-10'),
      reference: 'ACH-WIRE-88912',
      note: 'Wire from Acme Operating Account',
      createdById: staff.id,
      status: 'COMPLETED',
      allocations: {
        create: {
          invoiceId: inv1.id,
          allocatedAmount: 3864.52,
          allocatedAt: new Date('2026-01-10'),
        },
      },
    },
  });

  // Invoice 2: Partially Paid Invoice (Globex)
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00102',
      customerId: globex.id,
      subscriptionId: sub2.id,
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-10-01'),
      issuedAt: new Date('2026-09-01'),
      dueAt: new Date('2026-10-01'),
      status: 'PARTIALLY_PAID',
      currency: 'USD',
      subtotal: 1200.0,
      discountTotal: 120.0,
      discountRuleId: welcomeDisc.id,
      taxTotal: 216.0,
      grandTotal: 1296.0,
      amountPaid: 500.0,
      lines: {
        create: [
          {
            productId: crm.id,
            variantId: crmStandard.id,
            descriptionSnapshot: 'Brightloop CRM - Standard Edition',
            quantity: 1,
            unitPrice: 1200.0,
            discountAmount: 120.0,
            taxRate: 20.0,
            taxAmount: 216.0,
            lineTotal: 1296.0,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0002',
      method: 'CREDIT_CARD',
      amount: 500.0,
      currency: 'USD',
      paidAt: new Date('2026-09-15'),
      reference: 'TXN-CARD-4991',
      note: 'Partial payment installment',
      createdById: staff.id,
      status: 'COMPLETED',
      allocations: {
        create: {
          invoiceId: inv2.id,
          allocatedAmount: 500.0,
          allocatedAt: new Date('2026-09-15'),
        },
      },
    },
  });

  // Invoice 3: OVERDUE Invoice (Nexus Tech) - Past due date, unpaid
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00099',
      customerId: nexus.id,
      periodStart: new Date('2026-08-01'),
      periodEnd: new Date('2026-09-01'),
      issuedAt: new Date('2026-08-01'),
      dueAt: new Date('2026-08-16'), // Past due date!
      status: 'CONFIRMED',
      currency: 'USD',
      subtotal: 2400.0,
      discountTotal: 0.0,
      taxTotal: 432.0,
      grandTotal: 2832.0,
      amountPaid: 0.0, // Unpaid -> Overdue!
      notes: 'Payment reminder dispatched.',
      lines: {
        create: [
          {
            productId: erp.id,
            descriptionSnapshot: 'Brightloop ERP Cloud',
            quantity: 1,
            unitPrice: 2400.0,
            taxRate: 18.0,
            taxAmount: 432.0,
            lineTotal: 2832.0,
          },
        ],
      },
    },
  });

  // 11. Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: admin.id,
        action: 'CATALOG_INITIALIZED',
        entityType: 'Product',
        entityId: crm.id,
        afterJson: JSON.stringify({ name: crm.name, salesPrice: crm.salesPrice }),
      },
      {
        actorUserId: staff.id,
        action: 'PAYMENT_RECORDED',
        entityType: 'Payment',
        entityId: 'PAY-2026-0001',
        afterJson: JSON.stringify({ amount: 3864.52, invoiceNumber: 'INV-2026-00101' }),
      },
      {
        actorUserId: admin.id,
        action: 'SUBSCRIPTION_PAUSED',
        entityType: 'Subscription',
        entityId: sub3.id,
        afterJson: JSON.stringify({ status: 'PAUSED', reason: 'Seasonal pause' }),
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Admin user:    admin@brightloop.io / BrightLoop#2026');
  console.log('Staff user:    staff@brightloop.io / BrightStaff#2026');
  console.log('Customer user: john@acme.com / Customer#2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
