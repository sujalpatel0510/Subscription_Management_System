const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Enhance Plans view: add Edit and Delete buttons on each plan card
const oldPlanCards = `{pl.allowRenew ? '✓ Renewable' : '✕ Auto-End'}
                        </span>
                      </div>
                    </div>
                  </div>`;

const newPlanCards = `{pl.allowRenew ? '✓ Renewable' : '✕ Auto-End'}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingPlan(pl)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition active:scale-95"
                        >
                          Edit Plan
                        </button>
                        <button
                          onClick={() => handleDeletePlan(pl.id, pl.name)}
                          className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>`;

if (content.includes(oldPlanCards)) {
  content = content.replace(oldPlanCards, newPlanCards);
}

// 2. Enhance Products view: add Edit and Delete buttons on each product card
const oldProductVariants = `</div>
                      )}
                    </div>
                  </div>`;

const newProductVariants = `</div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>`;

if (content.includes(oldProductVariants)) {
  content = content.replace(oldProductVariants, newProductVariants);
}

// 3. Enhance Customers view: add Actions column with Edit & Delete buttons
const oldCustomersTableHead = `<th className="py-3 px-4">Active Subscriptions</th>
                      </tr>`;

const newCustomersTableHead = `<th className="py-3 px-4">Active Subscriptions</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>`;

if (content.includes(oldCustomersTableHead)) {
  content = content.replace(oldCustomersTableHead, newCustomersTableHead);
}

const oldCustomerRow = `<td className="py-3 px-4">
                              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-bold">
                                {c.subscriptions?.length || 0} active
                              </span>
                            </td>
                          </tr>`;

const newCustomerRow = `<td className="py-3 px-4">
                              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[11px] font-bold">
                                {c.subscriptions?.length || 0} active
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setEditingCustomer(c)}
                                className="rounded-lg border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-accent transition active:scale-95"
                              >
                                Edit
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteCustomer(c.id, c.legalName)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>`;

if (content.includes(oldCustomerRow)) {
  content = content.replace(oldCustomerRow, newCustomerRow);
}

// 4. Enhance Quotations view: add Cancel & Delete buttons
const oldQuoteActions = `<td className="py-3 px-4 text-right">
                              {qt.status !== 'CONFIRMED' && !isCustomer && (
                                <button
                                  onClick={() => handleConfirmQuote(qt.id)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  Convert to Sub
                                </button>
                              )}
                            </td>`;

const newQuoteActions = `<td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              {qt.status !== 'CONFIRMED' && !isCustomer && (
                                <button
                                  onClick={() => handleConfirmQuote(qt.id)}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition active:scale-95"
                                >
                                  Convert to Sub
                                </button>
                              )}
                              {qt.status !== 'CONFIRMED' && qt.status !== 'CANCELLED' && !isCustomer && (
                                <button
                                  onClick={() => handleCancelQuotation(qt.id, qt.quoteNumber)}
                                  className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition active:scale-95"
                                >
                                  Cancel
                                </button>
                              )}
                              {!isCustomer && (
                                <button
                                  onClick={() => handleDeleteQuotation(qt.id, qt.quoteNumber)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2 py-1 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                                >
                                  Delete
                                </button>
                              )}
                            </td>`;

if (content.includes(oldQuoteActions)) {
  content = content.replace(oldQuoteActions, newQuoteActions);
}

// 5. Enhance Subscriptions view: add Edit and Delete buttons
const oldSubRenewBtn = `{sub.status !== 'CLOSED' && sub.allowRenew && sub.plan.allowRenew && (
                                <button
                                  onClick={() => handleSubAction(sub.id, 'RENEW')}
                                  className="rounded-lg bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 font-semibold hover:bg-primary/20 transition"
                                >
                                  Renew Term
                                </button>
                              )}`;

const newSubRenewBtn = `{sub.status !== 'CLOSED' && sub.allowRenew && sub.plan.allowRenew && (
                                <button
                                  onClick={() => handleSubAction(sub.id, 'RENEW')}
                                  className="rounded-lg bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 font-semibold hover:bg-primary/20 transition active:scale-95"
                                >
                                  Renew Term
                                </button>
                              )}

                              {!isCustomer && (
                                <button
                                  onClick={() => setEditingSubscription(sub)}
                                  className="rounded-lg border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-accent transition active:scale-95"
                                >
                                  Edit
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteSubscription(sub.id, sub.subscriptionNumber)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                                >
                                  Delete
                                </button>
                              )}`;

if (content.includes(oldSubRenewBtn)) {
  content = content.replace(oldSubRenewBtn, newSubRenewBtn);
}

// 6. Enhance Invoices view: add Delete button for drafts
const oldInvoiceCancelBtn = `{!isCustomer && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleCancelInvoice(inv.id)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900 bg-card px-2 py-1 font-semibold text-destructive hover:bg-destructive/10 transition"
                                >
                                  Cancel
                                </button>
                              )}`;

const newInvoiceCancelBtn = `{!isCustomer && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleCancelInvoice(inv.id)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900 bg-card px-2 py-1 font-semibold text-destructive hover:bg-destructive/10 transition active:scale-95"
                                >
                                  Cancel
                                </button>
                              )}
                              {!isCustomer && inv.amountPaid === 0 && (inv.status === 'DRAFT' || inv.status === 'CANCELLED') && (
                                <button
                                  onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2 py-1 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                                >
                                  Delete
                                </button>
                              )}`;

if (content.includes(oldInvoiceCancelBtn)) {
  content = content.replace(oldInvoiceCancelBtn, newInvoiceCancelBtn);
}

// 7. Enhance Payments view: add Actions column with Void and Delete buttons
const oldPaymentsTableHead = `<th className="py-3 px-4">Status</th>
                      </tr>`;

const newPaymentsTableHead = `<th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>`;

if (content.includes(oldPaymentsTableHead)) {
  content = content.replace(oldPaymentsTableHead, newPaymentsTableHead);
}

const oldPaymentStatusCell = `<td className="py-3 px-4">
                              <span
                                className={\`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase \${
                                  p.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }\`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>`;

const newPaymentStatusCell = `<td className="py-3 px-4">
                              <span
                                className={\`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase \${
                                  p.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }\`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              {!isCustomer && p.status === 'COMPLETED' && (
                                <button
                                  onClick={() => setVoidingPayment(p)}
                                  className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition active:scale-95"
                                >
                                  Void
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeletePayment(p.id, p.reference || p.id.slice(0, 8))}
                                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2 py-1 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>`;

if (content.includes(oldPaymentStatusCell)) {
  content = content.replace(oldPaymentStatusCell, newPaymentStatusCell);
}

// 8. Enhance Taxes & Discounts view: add "+ Create Tax Rate" button and Edit/Delete on cards
const oldTaxSectionHead = `<div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Active Tax Rates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">`;

const newTaxSectionHead = `<div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                    Active Tax Rates
                  </h3>
                  {isAdmin && (
                    <button
                      onClick={() => setShowNewTaxModal(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                      <span>+ Create Tax Rate</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">`;

if (content.includes(oldTaxSectionHead)) {
  content = content.replace(oldTaxSectionHead, newTaxSectionHead);
}

const oldTaxCard = `<div className="text-3xl font-black text-primary mt-2">{t.rate}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Calculation: {t.calculationType}</div>
                    </div>`;

const newTaxCard = `<div className="text-3xl font-black text-primary mt-2">{t.rate}%</div>
                      <div className="text-xs text-muted-foreground mt-1">Calculation: {t.calculationType}</div>
                      {isAdmin && (
                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingTaxRule(t)}
                            className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-accent transition active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTaxRule(t.id, t.name)}
                            className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>`;

if (content.includes(oldTaxCard)) {
  content = content.replace(oldTaxCard, newTaxCard);
}

const oldDiscountCard = `<div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Scope: {d.scopeType}</span>
                        <span>{d.minAmount ? \`Min: $\${d.minAmount}\` : 'No min spend'}</span>
                      </div>
                    </div>`;

const newDiscountCard = `<div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Scope: {d.scopeType}</span>
                        <span>{d.minAmount ? \`Min: $\${d.minAmount}\` : 'No min spend'}</span>
                      </div>
                      {isAdmin && (
                        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingDiscountRule(d)}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDiscountRule(d.id, d.code)}
                            className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>`;

if (content.includes(oldDiscountCard)) {
  content = content.replace(oldDiscountCard, newDiscountCard);
}

// 9. Update modal backdrops with outside click close handlers
// Modal 1: Printable invoice
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto">`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedInvoice(null); }}
        >
          <div className="w-full max-w-2xl my-8 rounded-2xl border border-border bg-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>`
);

// Modal 2: Record payment
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>`
);

// Modal 3: New Quote
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewQuoteModal(false); }}
        >
          <div className="w-full max-w-lg my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>`
);

// Modal 4: New Product
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Add Product to Catalog</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewProductModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Add Product to Catalog</h2>`
);

// Modal 5: New Plan
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Create Subscription Plan</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewPlanModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Create Subscription Plan</h2>`
);

// Modal 6: Staff invite
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Invite Internal Staff</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowStaffInviteModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Invite Internal Staff</h2>`
);

// Modal 7: New Discount
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-1">Create Discount / Coupon Rule</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewDiscountModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Create Discount / Coupon Rule</h2>`
);

// Modal 8: SignUp
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Customer Sign Up</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignUpModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Customer Sign Up</h2>`
);

// Modal 9: Forgot
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-1">Reset Password</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForgotModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Reset Password</h2>`
);

// Modal 10: New Customer
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-1">Add Customer Account</h2>`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewCustomerModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">Add Customer Account</h2>`
);

// Modal 11: Subscription Details
content = content.replace(
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border pb-4 mb-4">`,
  `<div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSubscription(null); }}
        >
          <div className="w-full max-w-xl my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border pb-4 mb-4">`
);

// 10. Mount the new Modals before the closing </div> of component
const closingTags = `    </div>
  );
}`;

const modalMounts = `
      {/* Dynamic Edit Modals */}
      <EditPlanModal
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <EditCustomerModal
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <EditTaxModal
        taxRule={editingTaxRule}
        onClose={() => setEditingTaxRule(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <NewTaxModal
        isOpen={showNewTaxModal}
        onClose={() => setShowNewTaxModal(false)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <EditDiscountModal
        discountRule={editingDiscountRule}
        onClose={() => setEditingDiscountRule(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <EditSubscriptionModal
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />

      <VoidPaymentModal
        payment={voidingPayment}
        onClose={() => setVoidingPayment(null)}
        onSuccess={() => refreshAllData()}
        showToast={showToast}
      />
    </div>
  );
}`;

if (!content.includes("<EditPlanModal")) {
  content = content.replace(closingTags, modalMounts);
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully enhanced tables and modals with full Edit/Delete actions and outside-click dismissals!');
