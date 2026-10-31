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

  const custUser3 = await prisma.user.create({
    data: {
      emailNormalized: 'david@linear.app',
      name: 'David Karsten',
      passwordHash: custPass,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  const custUser4 = await prisma.user.create({
    data: {
      emailNormalized: 'claire@supabase.io',
      name: 'Claire Zhang',
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

  const linear = await prisma.customerAccount.create({
    data: {
      userId: custUser3.id,
      legalName: 'Linear Technologies Corp',
      billingEmail: 'david@linear.app',
      taxId: 'US-EIN-123456789',
      billingAddress: '548 Market St, Suite 3500, San Francisco, CA 94104, USA',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
    },
  });

  const supabase = await prisma.customerAccount.create({
    data: {
      userId: custUser4.id,
      legalName: 'Supabase Cloud Pte Ltd',
      billingEmail: 'claire@supabase.io',
      taxId: 'SG-UEN-202012345M',
      billingAddress: '1 Raffles Place, #20-01 One Raffles Place, Singapore 048616',
      currency: 'USD',
      timezone: 'Asia/Singapore',
    },
  });

  const retool = await prisma.customerAccount.create({
    data: {
      legalName: 'Retool Global Solutions Ltd',
      billingEmail: 'finance@retool.com',
      taxId: 'GB-VAT-998877665',
      billingAddress: '10 Gresham Street, London, EC2V 7JD, UK',
      currency: 'USD',
      timezone: 'Europe/London',
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

  const gateway = await prisma.product.create({
    data: {
      name: 'Brightloop API Gateway',
      type: 'Service',
      salesPrice: 850.0,
      costPrice: 180.0,
      notes: 'High-throughput edge routing, rate limiting and cryptographic key distribution.',
      status: 'ACTIVE',
    },
  });

  const gatewayStandard = await prisma.productVariant.create({
    data: {
      productId: gateway.id,
      attributeName: 'Deployment Topology',
      attributeValue: 'Standard Edge Gateway',
      priceDelta: 0.0,
    },
  });

  const gatewayMultiRegion = await prisma.productVariant.create({
    data: {
      productId: gateway.id,
      attributeName: 'Deployment Topology',
      attributeValue: 'Global Multi-Region Failover',
      priceDelta: 320.0,
    },
  });

  const cluster = await prisma.product.create({
    data: {
      name: 'Dedicated PostgreSQL Isolation Pod',
      type: 'Infrastructure',
      salesPrice: 1800.0,
      costPrice: 450.0,
      notes: 'Single-tenant PostgreSQL 18.x instance with zero-lag read replicas.',
      status: 'ACTIVE',
    },
  });

  const cluster128gb = await prisma.productVariant.create({
    data: {
      productId: cluster.id,
      attributeName: 'Memory Capacity',
      attributeValue: '128GB High-Throughput RAM',
      priceDelta: 950.0,
    },
  });

  const tam = await prisma.product.create({
    data: {
      name: '24/7 Dedicated Technical Account Manager',
      type: 'Service',
      salesPrice: 650.0,
      costPrice: 200.0,
      notes: 'Dedicated enterprise solutions architect on 15-minute SLA.',
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

  const quarterlyPro = await prisma.plan.create({
    data: {
      name: 'Quarterly Growth Pro',
      price: 420.0,
      intervalUnit: 'MONTHLY',
      intervalCount: 3,
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

  const biannualScale = await prisma.plan.create({
    data: {
      name: 'Biannual Enterprise Scale',
      price: 800.0,
      intervalUnit: 'MONTHLY',
      intervalCount: 6,
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

  const caTax = await prisma.taxRate.create({
    data: { name: 'California Sales Tax 9.5%', rate: 9.5, jurisdiction: 'US-CA', active: true },
  });

  const vatTax = await prisma.taxRate.create({
    data: { name: 'VAT 20%', rate: 20.0, jurisdiction: 'EU/UK', active: true },
  });

  const germanTax = await prisma.taxRate.create({
    data: { name: 'German MwSt 19%', rate: 19.0, jurisdiction: 'DE', active: true },
  });

  const gstTax = await prisma.taxRate.create({
    data: { name: 'GST 18%', rate: 18.0, jurisdiction: 'IN', active: true },
  });

  const sgGst = await prisma.taxRate.create({
    data: { name: 'Singapore GST 9%', rate: 9.0, jurisdiction: 'SG', active: true },
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

  const cyberDisc = await prisma.discountRule.create({
    data: {
      code: 'CYBER30',
      name: '30% Enterprise Growth Deal',
      type: 'PERCENTAGE',
      value: 30.0,
      minAmount: 500.0,
      usageLimit: 50,
      usageCount: 1,
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

  const saasVip = await prisma.discountRule.create({
    data: {
      code: 'SAASVIP500',
      name: '$500 Infrastructure Credit',
      type: 'FIXED',
      value: 500.0,
      minAmount: 1800.0,
      usageLimit: 20,
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

  // 8. Sample Quotations
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

  const quote2 = await prisma.quotation.create({
    data: {
      quoteNumber: 'QT-2026-1002',
      customerId: linear.id,
      planId: quarterlyPro.id,
      status: 'CONFIRMED',
      issueDate: new Date('2026-09-01'),
      expiryDate: new Date('2026-10-01'),
      subtotal: 1170.0,
      discountTotal: 0.0,
      taxTotal: 111.15,
      total: 1281.15,
      notes: 'Global API Gateway Deployment with California tax compliance.',
      lines: {
        create: [
          {
            productId: gateway.id,
            variantId: gatewayMultiRegion.id,
            descriptionSnapshot: 'Brightloop API Gateway - Global Multi-Region Failover',
            quantity: 1,
            unitPrice: 1170.0,
            taxRate: 9.5,
            taxAmount: 111.15,
            lineTotal: 1281.15,
          },
        ],
      },
    },
  });

  const quote3 = await prisma.quotation.create({
    data: {
      quoteNumber: 'QT-2026-1003',
      customerId: supabase.id,
      planId: annualEnterprise.id,
      status: 'SENT',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      subtotal: 2750.0,
      discountTotal: 500.0,
      taxTotal: 202.50,
      total: 2452.50,
      notes: 'Dedicated 128GB RAM Isolation Pod with VIP credit applied.',
      lines: {
        create: [
          {
            productId: cluster.id,
            variantId: cluster128gb.id,
            descriptionSnapshot: 'Dedicated PostgreSQL Isolation Pod (128GB RAM)',
            quantity: 1,
            unitPrice: 2250.0,
            taxRate: 9.0,
            taxAmount: 202.50,
            lineTotal: 2452.50,
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

  // Subscription 4: Linear Technologies Corp - Quarterly Pro (Active)
  const sub4 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0004',
      customerId: linear.id,
      planId: quarterlyPro.id,
      status: 'ACTIVE',
      startDate: new Date('2026-04-01'),
      expiryDate: new Date('2027-04-01'),
      nextBillingDate: new Date('2026-11-01'),
      paymentTerms: 'Net 15',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenew: true,
      items: {
        create: [
          {
            productId: gateway.id,
            variantId: gatewayMultiRegion.id,
            descriptionSnapshot: 'Brightloop API Gateway (Global Multi-Region Failover)',
            quantity: 1,
            unitPrice: 1170.0,
            taxRuleId: caTax.id,
            taxRate: 9.5,
            amount: 1170.0,
          },
        ],
      },
      events: {
        create: [
          {
            fromStatus: 'QUOTATION',
            toStatus: 'ACTIVE',
            changedBy: 'Sarah Connor',
            reason: 'Linear signed master services agreement',
            createdAt: new Date('2026-04-01'),
          },
        ],
      },
    },
  });

  // Subscription 5: Supabase Cloud Pte Ltd - Annual Enterprise (Active)
  const sub5 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0005',
      customerId: supabase.id,
      planId: annualEnterprise.id,
      status: 'ACTIVE',
      startDate: new Date('2026-02-15'),
      expiryDate: new Date('2027-02-15'),
      nextBillingDate: new Date('2026-11-15'),
      paymentTerms: 'Net 30',
      autoClose: false,
      allowPause: true,
      allowEarlyClose: true,
      allowRenew: true,
      items: {
        create: [
          {
            productId: cluster.id,
            variantId: cluster128gb.id,
            descriptionSnapshot: 'Dedicated PostgreSQL Isolation Pod (128GB RAM)',
            quantity: 1,
            unitPrice: 2750.0,
            taxRuleId: sgGst.id,
            taxRate: 9.0,
            amount: 2750.0,
          },
          {
            productId: tam.id,
            descriptionSnapshot: '24/7 Dedicated Technical Account Manager',
            quantity: 1,
            unitPrice: 650.0,
            taxRuleId: sgGst.id,
            taxRate: 9.0,
            amount: 650.0,
          },
        ],
      },
      events: {
        create: [
          {
            fromStatus: 'DRAFT',
            toStatus: 'ACTIVE',
            changedBy: 'System Admin',
            reason: 'Provisioned enterprise cluster with dedicated TAM',
            createdAt: new Date('2026-02-15'),
          },
        ],
      },
    },
  });

  // Subscription 6: Retool Global Solutions Ltd - Closed
  const sub6 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0006',
      customerId: retool.id,
      planId: weeklySprint.id,
      status: 'CLOSED',
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-02-01'),
      paymentTerms: 'Immediate',
      autoClose: true,
      allowPause: false,
      allowEarlyClose: true,
      allowRenew: false,
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
      events: {
        create: [
          {
            fromStatus: 'ACTIVE',
            toStatus: 'CLOSED',
            changedBy: 'System Admin',
            reason: 'Weekly sprint term completed and auto-closed',
            createdAt: new Date('2026-02-01'),
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

  // Invoice 4: Fully Paid Invoice (Linear Technologies Corp)
  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00104',
      customerId: linear.id,
      subscriptionId: sub4.id,
      periodStart: new Date('2026-04-01'),
      periodEnd: new Date('2026-07-01'),
      issuedAt: new Date('2026-04-01'),
      dueAt: new Date('2026-04-16'),
      status: 'PAID',
      currency: 'USD',
      subtotal: 1170.0,
      discountTotal: 0.0,
      taxTotal: 111.15,
      grandTotal: 1281.15,
      amountPaid: 1281.15,
      notes: 'Paid via Stripe automated webhook.',
      lines: {
        create: [
          {
            productId: gateway.id,
            variantId: gatewayMultiRegion.id,
            descriptionSnapshot: 'Brightloop API Gateway (Global Multi-Region Failover)',
            quantity: 1,
            unitPrice: 1170.0,
            taxRate: 9.5,
            taxAmount: 111.15,
            lineTotal: 1281.15,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0003',
      method: 'CREDIT_CARD',
      amount: 1281.15,
      currency: 'USD',
      paidAt: new Date('2026-04-02'),
      reference: 'ch_stripe_990142',
      note: 'Stripe Direct Charge - Visa ending 4242',
      createdById: admin.id,
      status: 'COMPLETED',
      allocations: {
        create: {
          invoiceId: inv4.id,
          allocatedAmount: 1281.15,
          allocatedAt: new Date('2026-04-02'),
        },
      },
    },
  });

  // Invoice 5: Partially Paid Invoice with VIP Discount (Supabase Cloud)
  const inv5 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00105',
      customerId: supabase.id,
      subscriptionId: sub5.id,
      periodStart: new Date('2026-02-15'),
      periodEnd: new Date('2027-02-15'),
      issuedAt: new Date('2026-02-15'),
      dueAt: new Date('2026-03-15'),
      status: 'PARTIALLY_PAID',
      currency: 'USD',
      subtotal: 3400.0,
      discountTotal: 500.0,
      discountRuleId: saasVip.id,
      taxTotal: 261.0,
      grandTotal: 3161.0,
      amountPaid: 1500.0,
      notes: 'First milestone tranche received via corporate wire.',
      lines: {
        create: [
          {
            productId: cluster.id,
            variantId: cluster128gb.id,
            descriptionSnapshot: 'Dedicated PostgreSQL Isolation Pod (128GB RAM)',
            quantity: 1,
            unitPrice: 2750.0,
            discountAmount: 404.41,
            taxRate: 9.0,
            taxAmount: 211.10,
            lineTotal: 2556.69,
          },
          {
            productId: tam.id,
            descriptionSnapshot: '24/7 Dedicated Technical Account Manager',
            quantity: 1,
            unitPrice: 650.0,
            discountAmount: 95.59,
            taxRate: 9.0,
            taxAmount: 49.90,
            lineTotal: 604.31,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0004',
      method: 'BANK_TRANSFER',
      amount: 1500.0,
      currency: 'USD',
      paidAt: new Date('2026-02-28'),
      reference: 'DBS-WIRE-20260228',
      note: 'DBS Singapore Inward Remittance - Tranche 1',
      createdById: staff.id,
      status: 'COMPLETED',
      allocations: {
        create: {
          invoiceId: inv5.id,
          allocatedAmount: 1500.0,
          allocatedAt: new Date('2026-02-28'),
        },
      },
    },
  });

  // Invoice 6: Confirmed Open Invoice (Retool Global Solutions)
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-00106',
      customerId: retool.id,
      subscriptionId: sub6.id,
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-02-01'),
      issuedAt: new Date('2026-01-01'),
      dueAt: new Date('2026-01-31'),
      status: 'CONFIRMED',
      currency: 'USD',
      subtotal: 1200.0,
      discountTotal: 0.0,
      taxTotal: 240.0,
      grandTotal: 1440.0,
      amountPaid: 0.0,
      notes: 'Final sprint closeout invoice.',
      lines: {
        create: [
          {
            productId: crm.id,
            variantId: crmStandard.id,
            descriptionSnapshot: 'Brightloop CRM - Standard Edition',
            quantity: 1,
            unitPrice: 1200.0,
            taxRate: 20.0,
            taxAmount: 240.0,
            lineTotal: 1440.0,
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
