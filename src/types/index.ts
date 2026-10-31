// Entity types mirroring the Prisma schema. Dates arrive as ISO strings over JSON.

export type Role = "ADMIN" | "STAFF" | "CUSTOMER";

export interface User {
  id: string;
  emailNormalized: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: string;
  customerAccount?: CustomerAccount | null;
}

export interface CustomerAccount {
  id: string;
  legalName: string;
  billingEmail: string;
  taxId: string | null;
  billingAddress: string | null;
  currency: string;
  timezone: string;
  createdAt: string;
  user?: Pick<User, "id" | "emailNormalized" | "role" | "status"> | null;
  subscriptions?: Subscription[];
  invoices?: Invoice[];
  subscriptionsCount?: number;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number;
  notes: string | null;
  status: string;
  createdAt: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  attributeName: string;
  attributeValue: string;
  priceDelta: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  intervalUnit: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | string;
  intervalCount: number;
  minQuantity: number;
  autoClose: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenew: boolean;
  status: string;
  createdAt: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  jurisdiction: string | null;
  isDefault: boolean;
  status: string;
}

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | string;
  value: number;
  minAmount: number | null;
  minQuantity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  scopeType: string;
  productId: string | null;
  status: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: CustomerAccount;
  planId: string | null;
  plan?: Plan | null;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED" | string;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  notes: string | null;
  lines?: QuotationLine[];
}

export interface QuotationLine {
  id: string;
  quotationId: string;
  productId: string;
  variantId: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  reason: string | null;
  createdAt: string;
}

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  productId: string;
  variantId: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customer?: CustomerAccount;
  planId: string;
  plan?: Plan | null;
  quotationId: string | null;
  status: "DRAFT" | "QUOTATION" | "CONFIRMED" | "ACTIVE" | "PAUSED" | "CLOSED" | string;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string | null;
  paymentTerms: string;
  autoClose: boolean;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenew: boolean;
  items?: SubscriptionItem[];
  events?: SubscriptionEvent[];
  invoices?: Invoice[];
}

export interface InvoiceLine {
  id: string;
  productId: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: CustomerAccount;
  subscriptionId: string | null;
  subscription?: Subscription | null;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  dueAt: string;
  status: "DRAFT" | "CONFIRMED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED" | string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  notes: string | null;
  lines?: InvoiceLine[];
}

export interface Payment {
  id: string;
  paymentNumber: string;
  method: string;
  amount: number;
  currency: string;
  paidAt: string;
  reference: string | null;
  note: string | null;
  status: "COMPLETED" | "VOIDED" | string;
  voidReason: string | null;
  createdBy?: { name?: string | null; emailNormalized?: string } | null;
  allocations?: Array<{
    invoiceId: string;
    invoice?: Invoice;
    allocatedAmount: number;
  }>;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorUser?: { name: string | null; emailNormalized: string } | null;
  createdAt: string;
}

export interface StaffInvite {
  id: string;
  email: string;
  role: string;
  status?: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface ReportsOverview {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  totalCustomers: number;
  newCustomers?: number;
  totalBilled: number;
  totalOutstanding: number;
  paidRevenue: number;
  overdueInvoices?: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    daysOverdue: number;
    balance: number;
    dueAt: string;
  }>;
  overdueCount?: number;
  revenueByMonth?: Array<{ month: string; billed: number; paid: number }>;
  [key: string]: unknown;
}

// Querystring helpers shared by list pages
export interface ListQuery {
  search: string;
  status: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}
