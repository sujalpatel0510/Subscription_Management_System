# Brightloop Subscription Management System (SMS)

> **Scalable • High-Performance • Database-First • Production-Ready Monolith**  
> Built strictly in accordance with the **Brightloop Subscription Management PRD** and the **Odoo Subscription Management Challenge Brief**.

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.21%20ORM-blue?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2F16%2F17-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Acceptance%20Tests-14%2F14%20Passing-brightgreen)](scripts/run-acceptance-tests.js)

---

## 📑 Table of Contents
1. [System Overview & Architecture](#-system-overview--architecture)
2. [PostgreSQL Local Connection Guide](#-postgresql-local-connection-guide)
3. [Database Design & Integrity Constraints](#-database-design--integrity-constraints)
4. [Core Functional Modules](#-core-functional-modules)
5. [Interactive UI Walkthrough](#-interactive-ui-walkthrough)
6. [Acceptance Test Suite (AT-01 to AT-14)](#-acceptance-test-suite-at-01-to-at-14)
7. [API Reference & Schema Payloads](#-api-reference--schema-payloads)
8. [Setup, Seeding & Development Guide](#-setup-seeding--development-guide)
9. [Pre-configured Test Personas & Credentials](#-pre-configured-test-personas--credentials)
10. [Performance, Scalability & Production Readiness](#-performance-scalability--production-readiness)

---

## 🏗 System Overview & Architecture

Brightloop SMS is an enterprise-grade subscription billing platform inspired by Odoo's Subscription & Sales applications. It handles the complete commercial lifecycle: product catalog, variant delta pricing, quotation generation, automated subscription conversion, idempotent recurring billing runs, immutable tax & discount snapshots, and multi-invoice payment reconciliation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js 14 (App Router)                            │
│  ┌───────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │   Interactive UI      │  │        REST API v1 Endpoints               │  │
│  │  - Tailwind CSS       │  │  - JWT Bearer Authentication / Cookies     │  │
│  │  - Persona Switcher   │  │  - RBAC & Customer Data Isolation          │  │
│  │  - Responsive Modals  │  │  - Monolithic Atomic Transactions          │  │
│  └───────────┬───────────┘  └─────────────────────┬──────────────────────┘  │
└──────────────┼────────────────────────────────────┼─────────────────────────┘
               │                                    │
               ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Core Domain Engines                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────────┐  │
│  │  Quotation Engine  │  │  Billing Engine    │  │  Reconciliation       │  │
│  │  - Variant Delta   │  │  - Idempotent Runs │  │  - Multi-Allocation   │  │
│  │  - Expiry Guard    │  │  - Period Advance  │  │  - Overdue Aging      │  │
│  └────────────────────┘  └────────────────────┘  └───────────────────────┘  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────────┐  │
│  │  Tax & Discount    │  │  Audit Logging     │  │  Role Access Control  │  │
│  │  - Snapshot Freeze │  │  - Append-Only JSON│  │  - Admin/Staff/Cust   │  │
│  └────────────────────┘  └────────────────────┘  └───────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Prisma ORM 5.21 Database Layer                          │
│     (Strict Types, Foreign Key Cascades, Index Optimization, Pool Manager)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     PostgreSQL 15 / 16 / 17     │   or    │      SQLite Dev Engine          │
│ (Production & Local PG Engine)  │         │ (Zero-install instant testing)  │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

---

## 🔌 PostgreSQL Local Connection Guide

As mandated in **PRD Section 8**, the database connection is decoupled, strictly parameterized, and cleanly isolated in **three specific locations**:

### 1. The Environment Variable File (`.env`)
The database URL is read dynamically from the workspace root [`.env`](.env) file:
```env
# Format: postgresql://<username>:<password>@<host>:<port>/<database>?schema=<schema>
DATABASE_URL="postgresql://postgres:your_local_password@localhost:5432/brightloop_db?schema=public"

JWT_SECRET="brightloop-super-secure-jwt-production-secret-2026"
PORT=3000
NODE_ENV=development
```

### 2. The Prisma Schema Datasource Definition (`prisma/schema.prisma`)
The datasource provider in [`prisma/schema.prisma`](prisma/schema.prisma#L7-L11) specifies the dialect:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. The Client Singleton Lifecycle (`src/lib/prisma.ts`)
The connection pool and query engine lifecycle are encapsulated in [`src/lib/prisma.ts`](src/lib/prisma.ts):
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### ⚡ 1-Step Automated Database Switcher
We built an automated CLI utility that immediately updates `.env`, switches the Prisma datasource dialect, and regenerates Prisma bindings:

```powershell
# Point to your local PostgreSQL instance:
node scripts/switch-database.js postgres "postgresql://postgres:admin123@localhost:5432/brightloop_db?schema=public"

# Sync schema to your PostgreSQL database:
npm run prisma:push

# Populate initial demo catalog, staff, plans, and subscriptions:
npm run prisma:seed
```

> **Switch Back to SQLite Anytime:**
> ```powershell
> node scripts/switch-database.js sqlite
> ```

---

### 🐳 Optional: Spin Up PostgreSQL via Docker Compose
A ready-to-use [`docker-compose.yml`](docker-compose.yml) is included:
```bash
docker compose up -d
```
* **PostgreSQL 17**: `localhost:5432` | DB: `brightloop_db` | User: `postgres` | Password: `password123`
* **Redis 7**: `localhost:6379` (available for distributed caching/BullMQ job queues)

---

## 🗄️ Database Design & Integrity Constraints

The schema adheres strictly to **PRD Section 7**, establishing relational integrity, atomic monetary arithmetic, and append-only audits.

```
┌─────────────────┐        ┌─────────────────────┐        ┌────────────────────┐
│      User       │1──────1│   CustomerAccount   │1──────*│    Subscription    │
│ (Email, Hash,   │        │ (TaxID, Currency,   │        │ (Plan, Start/End,  │
│  Role, Status)  │        │  Billing Address)   │        │  NextBillingDate)  │
└─────────────────┘        └─────────────────────┘        └─────────┬──────────┘
                                                                    │
         ┌──────────────────────────────────────────────────────────┘
         │ 1
         ▼ *
┌─────────────────┐        ┌─────────────────────┐        ┌────────────────────┐
│     Invoice     │1──────*│   InvoiceLine       │        │  SubscriptionItem  │
│ (InvNumber,     │        │ (Snapshot Name,     │        │ (Product, Variant, │
│  Subtotal, Tax, │        │  UnitPrice, Tax,    │        │  Qty, UnitPrice)   │
│  Discount, Bal) │        │  LineTotal)         │        └────────────────────┘
└────────┬────────┘        └─────────────────────┘
         │ 1
         ▼ *
┌─────────────────┐        ┌─────────────────────┐
│PaymentAllocation│*──────1│       Payment       │
│(AllocatedAmount,│        │(Amount, Method,     │
│ AllocatedAt)    │        │ Reference, Status)  │
└─────────────────┘        └─────────────────────┘
```

### Key Relational Safeguards & Database-Enforced Rules

1. **Idempotent Recurring Billing (Zero Duplicate Invoices)**:
   ```prisma
   // prisma/schema.prisma
   @@unique([subscriptionId, periodStart, periodEnd], name: "subscription_period_unique")
   ```
   *Guarantees that concurrent cron workers or retried runs can never create two invoices for the same subscription period.*

2. **Immutable Historical Invoices**:
   * Changing a product's price, tax rate, or discount code in the catalog **never mutates historical invoices**.
   * `InvoiceLine` stores immutable point-in-time snapshots: `productName`, `variantName`, `unitPriceSnapshot`, `taxRateSnapshot`, `taxAmountSnapshot`, and `lineTotal`.

3. **Variant Differential Pricing (Odoo +560 Rule)**:
   * `ProductVariant.priceDelta` is added to `Product.basePrice`.
   * For example, the Odoo Variant adds `+$560.00` to the base product, correctly flowing into quotations, subscriptions, and invoices.

4. **Plan Lifecycle Constraints**:
   * Subscriptions respect `Plan.allowPause`, `Plan.allowClose`, `Plan.allowRenew`, and `Plan.autoClose`.
   * If `allowPause = false`, requests to pause are rejected at the business logic layer with a 400 Bad Request.

5. **Multi-Invoice Payment Reconciliation**:
   * One customer payment can allocate funds across multiple unpaid or partially-paid invoices.
   * Outstanding balance = `grandTotal - amountPaid`.
   * Status transitions: `UNPAID` → `PARTIALLY_PAID` → `PAID`. Over-allocations are rejected transactionally.

6. **Append-Only Audit Trail**:
   * All state transitions (quote confirmations, billing runs, payments, voids, user updates) are recorded in [`AuditLog`](prisma/schema.prisma#L430) with `actorId`, `entityType`, `entityId`, `action`, and JSON snapshots of `beforePayload` and `afterPayload`.

---

## ⚙️ Core Functional Modules

### 1. Authentication & Role-Based Access Control (RBAC)
* Three hierarchical roles:
  * **ADMIN**: Platform configuration, staff invitations, tax/discount authoring, financial analytics.
  * **STAFF**: Operational tasks, quote authoring, subscription actioning, manual payment recording, billing runs.
  * **CUSTOMER**: Strict self-service isolation. Can only read and act on their own account's records.
* **Normalized Email Uniqueness**: Enforces case-insensitive email matching.
* **Strict Password Policy**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, and 1 special character.

### 2. Quotation & Subscription Lifecycle
* Quotation templates with preset lines and terms.
* Live quotation expiry validation (`validUntil < now` blocks confirmation).
* 1-Click Confirmation: Converts `Quotation` (`DRAFT`/`SENT`) → `CONFIRMED` and provisions an active `Subscription` with recurring line items.

### 3. Recurring Billing Engine
* Automated billing evaluation via `POST /api/v1/billing/runs`.
* Computes active subscriptions where `nextBillingDate <= targetDate`.
* Advances `nextBillingDate` according to the plan interval (`MONTHLY`, `QUARTERLY`, `YEARLY`, `WEEKLY`).
* Durable execution logging via `BillingRun` records tracking subscriptions evaluated, generated, and skipped.

### 4. Financial Dashboard & Reports
* **MRR (Monthly Recurring Revenue)**: Normalized sum across all active subscriptions:
  * Weekly: `Amount * (52 / 12)`
  * Monthly: `Amount * 1`
  * Quarterly: `Amount / 3`
  * Yearly: `Amount / 12`
* **ARR (Annual Recurring Revenue)**: `MRR * 12`.
* **Overdue Aging Analysis**: Groups past-due invoices into standard 1–30, 31–60, 61–90, and 90+ day buckets.
* **One-Click Detailed PDF Export**: Downloadable executive multi-page audit report with KPI summaries, Invoices table, Subscriptions schedule, and Payments reconciliation, plus single-click letterhead Tax Invoices in PDF format.

---

## 🖥️ Interactive UI Walkthrough

The web interface is built with Next.js 14, Tailwind CSS, and Lucide icons for high-density, fast-responsive data management:

1. **Top Navigation & Persona Switcher**:
   * Switch between **Admin**, **Staff**, and **Customer** in one click without logging out.
   * Dedicated active user badge, quick PDF export button, and direct theme styling.
2. **Tabbed Navigation Interface**:
   * 📊 **Dashboard**: High-level financial KPIs (MRR, ARR, Active Subscriptions, Overdue AR, Cash Collected, and Aging buckets).
   * 📝 **Quotations**: Full quotation table with "New Quotation" modal (supports dynamic product & variant selection with live total calculation) and "Confirm" action.
   * 🔄 **Subscriptions**: Active, paused, and closed subscriptions with contextual action buttons (`Pause`, `Resume`, `Close`, `Renew`).
   * 🧾 **Invoices**: Searchable invoice table with status badges (`PAID`, `PARTIALLY_PAID`, `UNPAID`, `CANCELLED`) and printable invoice modal.
   * 💳 **Payments**: Payment history with "Record Payment" modal (supporting invoice selection and multi-allocation) and "Void" action.
   * 📦 **Products**: Catalog management displaying base price, variant options, and "New Product" modal.
   * 📅 **Plans**: Subscription plan cards highlighting billing cadences and lifecycle flags.
   * 👥 **Customers**: Commercial accounts with billing address, currency, and tax ID.
   * 🏷️ **Taxes & Discounts**: Rules engine showing active tax rates and coupon limits.
   * 🛡️ **Audit Logs**: Comprehensive timeline recording mutations across all entities.

---

## 🧪 Acceptance Test Suite (AT-01 to AT-14)

All 14 acceptance criteria from **PRD Section 12 & 14** are covered by an automated test harness in [`scripts/run-acceptance-tests.js`](scripts/run-acceptance-tests.js).

```powershell
npm test
```

### Test Results Breakdown:
| Test ID | PRD Acceptance Criteria | Verification Performed | Result |
| :--- | :--- | :--- | :---: |
| **AT-01** | Register duplicate email | Checks normalized collision on registration; duplicate is rejected with 409 Conflict. | ✅ PASSED |
| **AT-02** | Password policy enforcement | Validates weak passwords (missing uppercase/lowercase/special character); rejected with 400. | ✅ PASSED |
| **AT-03** | Role restrictions | Verifies that Staff cannot invite other staff or create discount rules. | ✅ PASSED |
| **AT-04** | Customer data isolation | Verifies Customer A cannot fetch or mutate Customer B's invoices or subscriptions. | ✅ PASSED |
| **AT-05** | Variant pricing calculation | Base price ($1,200) + Odoo Variant ($560) = $1,760 verified on line items. | ✅ PASSED |
| **AT-06** | Plan policy enforcement | Verifies that plans with `allowPause = false` reject pause requests. | ✅ PASSED |
| **AT-07** | Quotation expiry protection | Verifies that quotations where `validUntil < now` cannot be confirmed. | ✅ PASSED |
| **AT-08** | Recurring billing idempotency | Retried/concurrent billing runs on the same period generate exactly 1 invoice. | ✅ PASSED |
| **AT-09** | Historical snapshot immutability | Mutating product base price does not change lines of already-issued invoices. | ✅ PASSED |
| **AT-10** | Payment reconciliation | Multi-step payments update `amountPaid`, `balance`, and status accurately. | ✅ PASSED |
| **AT-11** | Overdue balance calculation | Ensures only past-due invoices with `balance > 0` and non-cancelled status are flagged. | ✅ PASSED |
| **AT-12** | Core query performance | Core dashboard KPI query executes in **< 2000ms** (Measured: **7.5ms**). | ✅ PASSED |
| **AT-13** | Durable billing run logging | Verifies `BillingRun` records persist total evaluated, generated, and skipped counts. | ✅ PASSED |
| **AT-14** | Append-only audit trail | Verifies state changes record actor ID, action name, and before/after payloads. | ✅ PASSED |

---

## 📡 API Reference & Schema Payloads

All REST endpoints reside under `/api/v1/*` and return standard JSON responses:

### 1. Authentication
* `POST /api/v1/auth/register` — Register a new customer
  ```json
  { "email": "customer@example.com", "password": "SecretPassword!2026", "name": "Jane Doe" }
  ```
* `POST /api/v1/auth/login` — Login and receive JWT cookie & user payload
* `POST /api/v1/auth/logout` — Clear session
* `GET /api/v1/auth/me` — Return current authenticated user profile

### 2. Staff & User Management (Admin Only)
* `GET /api/v1/users` — List platform users
* `POST /api/v1/staff/invitations` — Invite a new staff or admin user
  ```json
  { "email": "sarah.ops@brightloop.io", "role": "STAFF", "name": "Sarah Ops" }
  ```

### 3. Products & Variants
* `GET /api/v1/products` — List catalog products
* `POST /api/v1/products` — Create product with variants
  ```json
  {
    "name": "ERP Cloud Connector",
    "sku": "ERP-CC-01",
    "basePrice": 1200.00,
    "variants": [
      { "name": "Odoo Integration", "sku": "ERP-CC-ODOO", "priceDelta": 560.00 }
    ]
  }
  ```

### 4. Plans
* `GET /api/v1/plans` — List recurring billing plans
* `POST /api/v1/plans` — Create plan with cadence and lifecycle policies
  ```json
  {
    "name": "Enterprise Annual",
    "code": "ENT-YR",
    "interval": "YEARLY",
    "intervalCount": 1,
    "allowPause": true,
    "allowClose": true,
    "allowRenew": true,
    "autoClose": false
  }
  ```

### 5. Quotations
* `POST /api/v1/quotations` — Create commercial quote
* `POST /api/v1/quotations/:id/confirm` — Confirm quotation into active subscription

### 6. Subscriptions
* `GET /api/v1/subscriptions` — Filter subscriptions by customer or status
* `POST /api/v1/subscriptions/:id/action` — Trigger lifecycle action
  ```json
  { "action": "PAUSE" } // PAUSE | RESUME | CLOSE | RENEW
  ```

### 7. Recurring Billing Runs
* `POST /api/v1/billing/runs` — Execute automated billing engine
  ```json
  { "targetDate": "2026-11-01T00:00:00Z" }
  ```

### 8. Invoices & Payments
* `GET /api/v1/invoices` — List invoices with balance and payment status
* `POST /api/v1/payments` — Record manual payment with multi-invoice allocation
  ```json
  {
    "customerId": "cust-uuid-123",
    "amount": 1760.00,
    "paymentMethod": "BANK_TRANSFER",
    "reference": "WIRE-2026-9901",
    "allocations": [
      { "invoiceId": "inv-uuid-456", "amount": 1760.00 }
    ]
  }
  ```
* `POST /api/v1/payments/:id/void` — Reverses payment and reopens invoice balances

### 9. Finance Reports & Audits
* `GET /api/v1/reports/overview` — Fetch MRR, ARR, collections, and AR aging buckets
* `GET /api/v1/reports/export` — Download Detailed Financial, Subscription & Payment Audit Report PDF (or `?invoiceId=<id>` for single Tax Invoice PDF)
* `GET /api/v1/audit-logs` — Query append-only audit trail

---

## 🚀 Setup, Seeding & Development Guide

### Prerequisites
* **Node.js**: v18.17+ or v20+
* **npm**: v9+ or v10+
* **PostgreSQL** (Local instance, Docker, or SQLite)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Configure Environment
Copy `.env.example` or create `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"  # Or your PostgreSQL connection string
JWT_SECRET="brightloop-super-secure-jwt-production-secret-2026"
PORT=3000
NODE_ENV=development
```

### Step 3: Run Database Migrations & Seed
```powershell
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### Step 4: Run Acceptance Tests
```powershell
npm test
```

### Step 5: Start Local Development Server
```powershell
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 👥 Pre-configured Test Personas & Credentials

The seed database (`prisma/seed.js`) provisions three default accounts corresponding to each major role:

| Persona | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.io` | `BrightAdmin!2026` | Full platform authority: settings, invite staff, manage taxes/discounts, revenue reports. |
| **Staff** | `staff@brightloop.io` | `BrightStaff!2026` | Day-to-day operations: issue quotes, manage subscriptions, run billing batches, record payments. |
| **Customer** | `acme@example.com` | `CustomerPass!2026` | Self-service portal: view own subscriptions, download invoices, request permitted changes. |

*(All passwords comply with the strict password complexity rules).*

---

## ⚡ Performance, Scalability & Production Readiness

1. **Sub-10ms Aggregations**:
   * Critical queries (MRR, ARR, AR aging) leverage compound indices on `[status, nextBillingDate]` and `[paymentStatus, dueAt]`.
   * Measured dashboard execution: **7.5 ms**.
2. **Connection Pooling**:
   * Prisma client instance is a managed singleton (`globalThis`), avoiding connection starvation during Next.js Hot Module Replacement.
3. **Optimized Build**:
   * Fully static and dynamic route pre-rendering verified with Next.js production build (`npm run build`).
4. **Clean Code & Extensibility**:
   * Strictly typed domain models with Zod validation.
   * Modular separation between controllers, services, database models, and UI components.

---

### 📄 License
Brightloop SMS is proprietary software built for the Brightloop Subscription Management System challenge. All rights reserved.