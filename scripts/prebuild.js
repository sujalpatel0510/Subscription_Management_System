const fs = require('fs');
const path = require('path');

const dirs = [
  '.next/types/app/api/v1',
  '.next/types/app/api/v1/auth',
  '.next/types/app/api/v1/invoices',
  '.next/types/app/api/v1/payments',
  '.next/types/app/api/v1/plans',
  '.next/types/app/api/v1/products',
  '.next/types/app/api/v1/quotations',
  '.next/types/app/api/v1/reports',
  '.next/types/app/api/v1/subscriptions',
  '.next/types/app/api/v1/tax-rules',
  '.next/types/app/api/v1/audit-logs',
  '.next/types/app/api/v1/auth/forgot-password',
  '.next/types/app/api/v1/auth/login',
  '.next/types/app/api/v1/auth/logout',
  '.next/types/app/api/v1/auth/me',
  '.next/types/app/api/v1/auth/register',
  '.next/types/app/api/v1/auth/reset-password',
  '.next/types/app/api/v1/billing/runs',
  '.next/types/app/api/v1/customers/[id]',
  '.next/types/app/api/v1/discount-rules/[id]',
  '.next/types/app/api/v1/invoices/[id]/cancel',
  '.next/types/app/api/v1/invoices/[id]/confirm',
  '.next/types/app/api/v1/invoices/[id]/send',
  '.next/types/app/api/v1/payments/[id]/void',
  '.next/types/app/api/v1/plans/[id]',
  '.next/types/app/api/v1/products/[id]',
  '.next/types/app/api/v1/quotation-templates',
  '.next/types/app/api/v1/quotations/[id]/confirm',
  '.next/types/app/api/v1/reports/export',
  '.next/types/app/api/v1/reports/overview',
  '.next/types/app/api/v1/staff/invitations',
  '.next/types/app/api/v1/subscriptions/[id]/action',
  '.next/types/app/api/v1/tax-rules/[id]',
  '.next/types/app/api/v1/users',
];

for (const d of dirs) {
  const fullTypeDir = path.join(__dirname, '..', d);
  const fullServerDir = path.join(__dirname, '..', d.replace('types', 'server'));
  try {
    fs.mkdirSync(fullTypeDir, { recursive: true });
    fs.mkdirSync(fullServerDir, { recursive: true });
  } catch (_) {}
}
