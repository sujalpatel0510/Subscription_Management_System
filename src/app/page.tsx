'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Layers,
  FileText,
  CreditCard,
  Package,
  Calendar,
  Percent,
  Users,
  Shield,
  Activity,
  Plus,
  Play,
  CheckCircle,
  AlertTriangle,
  Printer,
  Sparkles,
  TrendingUp,
  UserPlus,
  Search,
  Filter,
} from 'lucide-react';
import HeaderNavbar from '@/components/Navbar';

interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

export default function SMSApplication() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'invoices' | 'payments' | 'quotes' | 'catalog' | 'discounts' | 'customers' | 'staff' | 'audit'>('dashboard');
  const [currentUser, setCurrentUser] = useState<AuthPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Core Data
  const [overview, setOverview] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [taxRules, setTaxRules] = useState<any[]>([]);
  const [discountRules, setDiscountRules] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals & Details
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ invoiceId: '', amount: '', method: 'CREDIT_CARD', reference: '', note: '' });

  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [newQuoteForm, setNewQuoteForm] = useState({ customerId: '', planId: '', productId: '', variantId: '', quantity: 1, discountCode: '' });

  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', type: 'Software', salesPrice: '', costPrice: '', notes: '', variantName: 'Brand/Edition', variantValue: '', variantDelta: '' });

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: '', intervalUnit: 'MONTHLY', minQuantity: 1, allowPause: true, allowEarlyClose: true, allowRenew: true, autoClose: false });

  const [showStaffInviteModal, setShowStaffInviteModal] = useState(false);
  const [staffInviteForm, setStaffInviteForm] = useState({ email: '', name: '', temporaryPassword: '' });

  // Additional PRD Scene Modals
  const [quotationTemplates, setQuotationTemplates] = useState<any[]>([]);
  const [showNewDiscountModal, setShowNewDiscountModal] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    name: '',
    type: 'PERCENTAGE',
    value: '',
    minAmount: '',
    minQuantity: '',
    startsAt: '',
    endsAt: '',
    usageLimit: '',
    scopeType: 'ALL',
    productId: '',
  });

  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ email: '', name: '', password: '' });

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetResult, setResetResult] = useState<string | null>(null);

  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    legalName: '',
    billingEmail: '',
    taxId: '',
    billingAddress: '',
    currency: 'USD',
    password: '',
  });

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    switchUser('admin@brightloop.io');
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const switchUser = async (email: string) => {
    setLoading(true);
    try {
      let pwd = 'BrightLoop#2026';
      if (email.includes('staff')) pwd = 'BrightStaff#2026';
      if (email.includes('john') || email.includes('acme')) pwd = 'Customer#2026';

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data.user);
        await refreshAllData(data.data.user);
        showToast(`Authenticated as ${data.data.user.role}: ${data.data.user.email}`);
      } else {
        showToast(data.error || 'Authentication failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async (user = currentUser) => {
    try {
      const get = async (url: string) => {
        const r = await fetch(url);
        return r.json();
      };

      const [ov, sub, inv, pay, qt, prod, pl, cust, tmpl] = await Promise.all([
        get('/api/v1/reports/overview'),
        get('/api/v1/subscriptions'),
        get('/api/v1/invoices'),
        get('/api/v1/payments'),
        get('/api/v1/quotations'),
        get('/api/v1/products'),
        get('/api/v1/plans'),
        get('/api/v1/customers'),
        get('/api/v1/quotation-templates'),
      ]);

      if (ov.success) setOverview(ov.data);
      if (sub.success) setSubscriptions(sub.data.subscriptions);
      if (inv.success) setInvoices(inv.data.invoices);
      if (pay.success) setPayments(pay.data.payments);
      if (qt.success) setQuotations(qt.data.quotations);
      if (prod.success) setProducts(prod.data.products);
      if (pl.success) setPlans(pl.data.plans);
      if (cust.success) setCustomers(cust.data.customers);
      if (tmpl && tmpl.success) setQuotationTemplates(tmpl.data.templates || []);

      if (user && user.role !== 'CUSTOMER') {
        const [tx, ds, users, audit] = await Promise.all([
          get('/api/v1/tax-rules'),
          get('/api/v1/discount-rules'),
          get('/api/v1/users'),
          get('/api/v1/audit-logs'),
        ]);
        if (tx.success) setTaxRules(tx.data.taxRules);
        if (ds.success) setDiscountRules(ds.data.discountRules);
        if (users.success) setStaffUsers(users.data.users);
        if (audit.success) setAuditLogs(audit.data.auditLogs);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  // Automated Billing Run Trigger
  const handleTriggerBilling = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/billing/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowDate: new Date() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Billing Batch Complete: ${data.data.billingRun.summary}`);
        await refreshAllData();
      } else {
        showToast(data.error || 'Billing run failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Subscription Actions
  const handleSubAction = async (subId: string, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/subscriptions/${subId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || `Action ${action} executed`);
        setSelectedSubscription(null);
        await refreshAllData();
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Convert Quotation to Subscription
  const handleConfirmQuote = async (quoteId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/quotations/${quoteId}/confirm`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Quotation converted to Active Subscription!');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to confirm quotation', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Invoice (DRAFT -> CONFIRMED)
  const handleConfirmInvoice = async (invId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${invId}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Invoice confirmed!');
        if (selectedInvoice && selectedInvoice.id === invId) {
          setSelectedInvoice({ ...selectedInvoice, status: 'CONFIRMED' });
        }
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to confirm invoice', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Send Invoice to Customer Email
  const handleSendInvoice = async (invId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${invId}/send`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || 'Invoice sent to customer billing email!');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to send invoice', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Invoice
  const handleCancelInvoice = async (invId: string) => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (!reason) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${invId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Invoice cancelled successfully.');
        if (selectedInvoice && selectedInvoice.id === invId) {
          setSelectedInvoice({ ...selectedInvoice, status: 'CANCELLED' });
        }
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to cancel invoice', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Discount Rule (Admin Only - Scene 5)
  const handleCreateDiscountRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/discount-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountForm.code,
          name: discountForm.name,
          type: discountForm.type,
          value: Number(discountForm.value),
          minAmount: discountForm.minAmount ? Number(discountForm.minAmount) : undefined,
          minQuantity: discountForm.minQuantity ? Number(discountForm.minQuantity) : undefined,
          startsAt: discountForm.startsAt || undefined,
          endsAt: discountForm.endsAt || undefined,
          usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : undefined,
          scopeType: discountForm.scopeType,
          productIds: discountForm.productId ? [discountForm.productId] : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Discount Rule ${data.data.discountRule.code} created successfully!`);
        setShowNewDiscountModal(false);
        setDiscountForm({
          code: '',
          name: '',
          type: 'PERCENTAGE',
          value: '',
          minAmount: '',
          minQuantity: '',
          startsAt: '',
          endsAt: '',
          usageLimit: '',
          scopeType: 'ALL',
          productId: '',
        });
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to create discount rule', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer Sign-Up (Scene 1)
  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legalName: signUpForm.name,
          name: signUpForm.name,
          email: signUpForm.email,
          password: signUpForm.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Account successfully created for ${signUpForm.email}! Switched to your customer portal.`);
        setShowSignUpModal(false);
        setSignUpForm({ email: '', name: '', password: '' });
        if (data.data?.user) {
          setCurrentUser(data.data.user);
          await refreshAllData(data.data.user);
          setActiveTab('subscriptions');
        } else {
          await refreshAllData();
        }
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Customer Account (Admin / Staff)
  const handleCreateCustomerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Customer account for "${customerForm.legalName}" created successfully!`);
        setShowNewCustomerModal(false);
        setCustomerForm({
          legalName: '',
          billingEmail: '',
          taxId: '',
          billingAddress: '',
          currency: 'USD',
          password: '',
        });
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to create customer account', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Forgot Password (Scene 1)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResetResult(data.data.resetUrl || `Reset token: ${data.data.token}`);
        showToast('Password reset link generated!');
      } else {
        showToast(data.error || 'Failed to request reset', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment recorded and allocated successfully!');
        setShowPaymentModal(false);
        setPaymentForm({ invoiceId: '', amount: '', method: 'CREDIT_CARD', reference: '', note: '' });
        await refreshAllData();
      } else {
        showToast(data.error || 'Payment failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Create Quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: newQuoteForm.customerId,
          planId: newQuoteForm.planId,
          discountCode: newQuoteForm.discountCode || undefined,
          lines: [
            {
              productId: newQuoteForm.productId,
              variantId: newQuoteForm.variantId || null,
              quantity: Number(newQuoteForm.quantity) || 1,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Quotation #${data.data.quotation.quoteNumber} created!`);
        setShowNewQuoteModal(false);
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to create quotation', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Create Product with Variant
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const variants = productForm.variantValue
        ? [
            {
              attributeName: productForm.variantName || 'Edition',
              attributeValue: productForm.variantValue,
              priceDelta: Number(productForm.variantDelta || 0),
            },
          ]
        : [];

      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          type: productForm.type,
          salesPrice: Number(productForm.salesPrice),
          costPrice: Number(productForm.costPrice || 0),
          notes: productForm.notes,
          variants,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${productForm.name}" created!`);
        setShowNewProductModal(false);
        setProductForm({ name: '', type: 'Software', salesPrice: '', costPrice: '', notes: '', variantName: 'Brand/Edition', variantValue: '', variantDelta: '' });
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to create product', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Create Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name,
          price: Number(planForm.price),
          intervalUnit: planForm.intervalUnit,
          minQuantity: Number(planForm.minQuantity) || 1,
          allowPause: planForm.allowPause,
          allowEarlyClose: planForm.allowEarlyClose,
          allowRenew: planForm.allowRenew,
          autoClose: planForm.autoClose,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Plan "${planForm.name}" created!`);
        setShowNewPlanModal(false);
        setPlanForm({ name: '', price: '', intervalUnit: 'MONTHLY', minQuantity: 1, allowPause: true, allowEarlyClose: true, allowRenew: true, autoClose: false });
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to create plan', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Invite Staff
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/staff/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffInviteForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Staff member ${staffInviteForm.name} invited!`);
        setShowStaffInviteModal(false);
        setStaffInviteForm({ email: '', name: '', temporaryPassword: '' });
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to invite staff', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };



  const isCustomer = currentUser?.role === 'CUSTOMER';
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <HeaderNavbar
        currentUser={currentUser}
        onSwitchUser={switchUser}
        onOpenSignUp={() => setShowSignUpModal(true)}
        onOpenForgot={() => setShowForgotModal(true)}
      />

      {/* Floating Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-slate-900 text-white border border-slate-700'
              : 'bg-rose-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-white" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex flex-1">
        {/* Responsive Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isCustomer ? 'Customer Portal' : 'Workspace'}
              </div>
              <nav className="space-y-1">
                {!isCustomer && (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <PieChart className="h-4 w-4" />
                    <span>Finance Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === 'subscriptions'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>{isCustomer ? 'My Subscriptions' : 'Subscriptions'}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {subscriptions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === 'invoices'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>{isCustomer ? 'My Invoices' : 'Invoices & Billing'}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {invoices.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === 'payments'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{isCustomer ? 'Payment History' : 'Payments'}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {payments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeTab === 'quotes'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isCustomer ? 'My Quotations' : 'Quotations'}</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {quotations.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Admin & Staff Configuration Section */}
            {!isCustomer && (
              <div>
                <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Configuration
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'catalog'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span>Catalog & Plans</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('discounts')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'discounts'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    <span>Taxes & Discounts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'customers'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Customer Accounts</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('staff')}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activeTab === 'staff'
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Staff Management</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeTab === 'audit'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>System Audit Trail</span>
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Quick Billing Day Batch Simulator */}
          {!isCustomer && (
            <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-blue-600 fill-blue-600" />
                <span className="text-xs font-bold text-slate-900">Billing Day Batch</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Evaluates due subscriptions, applies discounts and generates period-unique invoices atomically.
              </p>
              <button
                disabled={actionLoading}
                onClick={handleTriggerBilling}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Run Billing Batch'}
              </button>
            </div>
          )}
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
          {/* TAB 1: FINANCE DASHBOARD */}
          {activeTab === 'dashboard' && overview && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Visibility & Revenue</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Normalized MRR, cash collections, and real-time receivables tracking.
                  </p>
                </div>
              </div>

              {/* 4 Summary Cards (PRD FR-12 / Section 3.1) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium uppercase tracking-wider">Active Subscriptions</span>
                    <Layers className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {overview.metrics.activeSubscriptionsCount}
                    </span>
                    <span className="text-xs font-medium text-emerald-600">in service</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium uppercase tracking-wider">Normalized MRR</span>
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${overview.metrics.mrr.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">ARR: ${overview.metrics.arr.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium uppercase tracking-wider">Cash Collected</span>
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${overview.metrics.cashCollected.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500">of ${overview.metrics.totalBilled.toLocaleString()} billed</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
                  <div className="flex items-center justify-between text-rose-600">
                    <span className="text-xs font-bold uppercase tracking-wider">Overdue Invoices</span>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-rose-700">
                      {overview.metrics.overdueInvoicesCount}
                    </span>
                    <span className="text-xs font-bold text-rose-600">
                      ${overview.metrics.overdueTotalValue.toLocaleString()} outstanding
                    </span>
                  </div>
                </div>
              </div>

              {/* Overdue Receivables Action Center */}
              {overview.overdueInvoices.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Overdue Collections Follow-Up</h2>
                      <p className="text-xs text-slate-500">Invoices past agreed due date with outstanding balance.</p>
                    </div>
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                      Priority Collections
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                        <tr>
                          <th className="py-2.5 px-4">Invoice #</th>
                          <th className="py-2.5 px-4">Customer</th>
                          <th className="py-2.5 px-4">Due Date</th>
                          <th className="py-2.5 px-4">Total</th>
                          <th className="py-2.5 px-4">Paid</th>
                          <th className="py-2.5 px-4">Outstanding</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {overview.overdueInvoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-rose-50/20">
                            <td className="py-3 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4 text-slate-700">{inv.customerName}</td>
                            <td className="py-3 px-4 text-rose-600 font-medium">
                              {new Date(inv.dueAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-semibold">${inv.grandTotal.toFixed(2)}</td>
                            <td className="py-3 px-4 text-slate-500">${inv.amountPaid.toFixed(2)}</td>
                            <td className="py-3 px-4 font-bold text-rose-600">
                              ${inv.outstandingBalance.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setPaymentForm({
                                    invoiceId: inv.id,
                                    amount: inv.outstandingBalance.toString(),
                                    method: 'BANK_TRANSFER',
                                    reference: '',
                                    note: 'Overdue recovery payment',
                                  });
                                  setShowPaymentModal(true);
                                }}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
                              >
                                Record Payment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {isCustomer ? 'My Subscriptions' : 'Subscriptions Management'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Lifecycle states: Draft → Quotation → Confirmed → Active → Closed (with Pause/Resume).
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => setShowNewQuoteModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create via Quotation</span>
                  </button>
                )}
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Subscription #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan / Interval</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Next Billing Date</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{sub.subscriptionNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{sub.customer.legalName}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{sub.plan.name}</span>
                          <span className="ml-1 text-[11px] text-slate-400">({sub.plan.intervalUnit})</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.status === 'PAUSED'
                                ? 'bg-amber-100 text-amber-800'
                                : sub.status === 'CLOSED'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(sub.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedSubscription(sub)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Details
                          </button>

                          {/* Plan-allowed action buttons */}
                          {sub.status === 'ACTIVE' && sub.allowPause && sub.plan.allowPause && (
                            <button
                              onClick={() => handleSubAction(sub.id, 'PAUSE')}
                              className="rounded-lg bg-amber-500 px-2.5 py-1 font-semibold text-white hover:bg-amber-600"
                            >
                              Pause
                            </button>
                          )}

                          {sub.status === 'PAUSED' && (
                            <button
                              onClick={() => handleSubAction(sub.id, 'RESUME')}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
                            >
                              Resume
                            </button>
                          )}

                          {sub.status !== 'CLOSED' && sub.allowEarlyClose && sub.plan.allowEarlyClose && (
                            <button
                              onClick={() => handleSubAction(sub.id, 'CLOSE')}
                              className="rounded-lg bg-rose-500 px-2.5 py-1 font-semibold text-white hover:bg-rose-600"
                            >
                              Close
                            </button>
                          )}

                          {sub.status !== 'CLOSED' && sub.allowRenew && sub.plan.allowRenew && (
                            <button
                              onClick={() => handleSubAction(sub.id, 'RENEW')}
                              className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-700"
                            >
                              Renew Term
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVOICES & BILLING */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {isCustomer ? 'My Invoices' : 'Invoices & Billing Schedule'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Immutable snapshots of products, variants, taxes, and applied discounts.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={handleTriggerBilling}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Run Billing Day Batch</span>
                  </button>
                )}
              </div>

              {/* Invoices List */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Grand Total</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{inv.customer.legalName}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'PARTIALLY_PAID'
                                ? 'bg-amber-100 text-amber-800'
                                : inv.status === 'CANCELLED'
                                ? 'bg-slate-100 text-slate-600'
                                : inv.isOverdue
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {inv.isOverdue ? 'OVERDUE' : inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">${inv.grandTotal.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">${inv.outstandingBalance.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View / Print
                          </button>
                          {!isCustomer && inv.status === 'DRAFT' && (
                            <button
                              onClick={() => handleConfirmInvoice(inv.id)}
                              className="rounded-lg bg-blue-600 px-2 py-1 font-semibold text-white hover:bg-blue-700"
                            >
                              Confirm
                            </button>
                          )}
                          {!isCustomer && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleSendInvoice(inv.id)}
                              className="rounded-lg bg-indigo-600 px-2 py-1 font-semibold text-white hover:bg-indigo-700"
                            >
                              Send
                            </button>
                          )}
                          {!isCustomer && inv.outstandingBalance > 0 && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                setPaymentForm({
                                  invoiceId: inv.id,
                                  amount: inv.outstandingBalance.toString(),
                                  method: 'CREDIT_CARD',
                                  reference: '',
                                  note: '',
                                });
                                setShowPaymentModal(true);
                              }}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
                            >
                              Pay
                            </button>
                          )}
                          {!isCustomer && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancelInvoice(inv.id)}
                              className="rounded-lg border border-rose-200 bg-white px-2 py-1 font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {isCustomer ? 'My Payment Receipts' : 'Payments & Allocations'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Multi-allocation records with audit tracking and instant invoice reconciliation.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => {
                      setPaymentForm({ invoiceId: '', amount: '', method: 'CREDIT_CARD', reference: '', note: '' });
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record Manual Payment</span>
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Payment #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Allocated Invoices</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.paymentNumber}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.method}</td>
                        <td className="py-3 px-4 text-slate-500">{p.reference || '—'}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">${p.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          {p.allocations?.map((a: any) => (
                            <span key={a.id} className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 mr-1">
                              {a.invoice?.invoiceNumber || a.invoiceId} (${a.allocatedAmount.toFixed(2)})
                            </span>
                          ))}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: QUOTATIONS */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {isCustomer ? 'My Quotations' : 'Quotations & Commercial Offers'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Reusable templates, variant pricing adjustments (e.g. Odoo +560), and 1-click subscription conversion.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => setShowNewQuoteModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Quotation</span>
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Quote #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Expires</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotations.map((qt) => (
                      <tr key={qt.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{qt.quoteNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{qt.customer.legalName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{qt.plan?.name || '—'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              qt.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {qt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{new Date(qt.expiryDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">${qt.total.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {qt.status !== 'CONFIRMED' && (
                            <button
                              onClick={() => handleConfirmQuote(qt.id)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
                            >
                              Convert to Sub
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CATALOG & PLANS */}
          {activeTab === 'catalog' && !isCustomer && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product & Plan Catalog</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Products with variants (e.g. Odoo brand +$560), cost price protection, and plan intervals.
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNewProductModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Product</span>
                    </button>
                    <button
                      onClick={() => setShowNewPlanModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Plan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Configured Products & Variants</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                              {p.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{p.notes}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-extrabold text-slate-900">${p.salesPrice.toFixed(2)}</div>
                          {p.costPrice !== undefined && (
                            <div className="text-[11px] text-slate-400">Cost: ${p.costPrice.toFixed(2)}</div>
                          )}
                        </div>
                      </div>

                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Configured Variants
                          </div>
                          <div className="space-y-1.5">
                            {p.variants.map((v: any) => (
                              <div key={v.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                                <span className="font-medium text-slate-700">
                                  {v.attributeName}: <strong className="text-slate-900">{v.attributeValue}</strong>
                                </span>
                                <span className="font-bold text-blue-700">
                                  {v.priceDelta > 0 ? `+ $${v.priceDelta.toFixed(2)}` : '$0.00'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans Section */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>Subscription Plans & Cadences</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((pl) => (
                    <div key={pl.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">{pl.name}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                            {pl.intervalUnit}
                          </span>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 mt-2">
                          ${pl.price.toFixed(2)}
                          <span className="text-xs font-normal text-slate-400"> / {pl.intervalUnit.toLowerCase()}</span>
                        </div>
                        <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Min Quantity:</span>
                            <strong className="text-slate-900">{pl.minQuantity} unit(s)</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Auto-Close:</span>
                            <strong>{pl.autoClose ? 'Yes' : 'No'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Allow Pause:</span>
                            <strong>{pl.allowPause ? 'Yes' : 'No'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Allow Early Close:</span>
                            <strong>{pl.allowEarlyClose ? 'Yes' : 'No'}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Allow Renew:</span>
                            <strong>{pl.allowRenew ? 'Yes' : 'No'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TAXES & DISCOUNTS */}
          {activeTab === 'discounts' && !isCustomer && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Taxes & Discount Rules</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Automatic tax resolution and Admin-managed discount eligibility.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewDiscountModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Discount Rule</span>
                  </button>
                )}
              </div>

              {/* Tax Rules */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900">Active Tax Rates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {taxRules.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {t.jurisdiction}
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold text-blue-600 mt-2">{t.rate}%</div>
                      <div className="text-xs text-slate-500 mt-1">Calculation: {t.calculationType}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Rules */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900">Configured Discount Rules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discountRules.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                            {d.code}
                          </span>
                          <h3 className="font-semibold text-slate-900 text-xs mt-2">{d.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-slate-900">
                            {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `$${d.value.toFixed(2)} OFF`}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Usage: {d.usageCount} / {d.usageLimit || '∞'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Scope: {d.scopeType}</span>
                        <span>{d.minAmount ? `Min: $${d.minAmount}` : 'No min spend'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMERS */}
          {activeTab === 'customers' && !isCustomer && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Accounts</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Commercial profiles, billing addresses, and tax identifiers.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Customer Account</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Legal Business Name</th>
                      <th className="py-3 px-4">Billing Email</th>
                      <th className="py-3 px-4">Tax / VAT ID</th>
                      <th className="py-3 px-4">Billing Address</th>
                      <th className="py-3 px-4">Currency</th>
                      <th className="py-3 px-4">Subscriptions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.legalName}</td>
                        <td className="py-3 px-4 text-blue-600">{c.billingEmail}</td>
                        <td className="py-3 px-4 text-slate-600">{c.taxId || '—'}</td>
                        <td className="py-3 px-4 text-slate-500">{c.billingAddress || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{c.currency}</td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                            {c.subscriptions?.length || 0} active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: STAFF MANAGEMENT (ADMIN ONLY) */}
          {activeTab === 'staff' && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Account Management</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Admin-controlled staff invitations and operational roles (PRD FR-01 & 5.1).
                  </p>
                </div>
                <button
                  onClick={() => setShowStaffInviteModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invite New Staff</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{u.name || '—'}</td>
                        <td className="py-3 px-4 text-slate-700">{u.emailNormalized}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'STAFF'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT TRAIL */}
          {activeTab === 'audit' && !isCustomer && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Audit Trail</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Append-only immutable audit log tracking all monetary and permission mutations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {log.actorUser?.emailNormalized || log.actorUserId || 'SYSTEM'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{log.entityType}</td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 font-mono max-w-xs truncate">
                          {log.afterJson || log.beforeJson || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: INVOICE PRINTABLE / DETAILS VIEW */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                    B
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">Brightloop Software</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Tax ID: US-EIN-992014 | billing@brightloop.io</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900">{selectedInvoice.invoiceNumber}</span>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      selectedInvoice.status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedInvoice.isOverdue ? 'OVERDUE' : selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-bold text-slate-900 text-sm mt-1">{selectedInvoice.customer.legalName}</div>
                <div className="text-slate-600">{selectedInvoice.customer.billingEmail}</div>
                <div className="text-slate-500">{selectedInvoice.customer.billingAddress}</div>
                {selectedInvoice.customer.taxId && (
                  <div className="text-slate-400 mt-1">Tax/VAT: {selectedInvoice.customer.taxId}</div>
                )}
              </div>
              <div className="space-y-1 text-right">
                <div>
                  <span className="text-slate-400">Issue Date:</span>{' '}
                  <strong className="text-slate-900">{new Date(selectedInvoice.issuedAt).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span>{' '}
                  <strong className="text-slate-900">{new Date(selectedInvoice.dueAt).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Billing Period:</span>{' '}
                  <strong className="text-slate-900">
                    {new Date(selectedInvoice.periodStart).toLocaleDateString()} – {new Date(selectedInvoice.periodEnd).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Item Snapshot Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Tax</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.lines?.map((l: any) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{l.descriptionSnapshot}</td>
                      <td className="py-2.5 px-4 text-center">{l.quantity}</td>
                      <td className="py-2.5 px-4 text-right">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        {l.taxRate}% (${l.taxAmount.toFixed(2)})
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">${l.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6 text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied:</span>
                    <span>- ${selectedInvoice.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax Total:</span>
                  <span>+ ${selectedInvoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Grand Total:</span>
                  <span>${selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span>${selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between text-sm font-bold text-blue-700">
                  <span>Outstanding Balance:</span>
                  <span>${selectedInvoice.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Invoice</span>
                </button>
                {!isCustomer && selectedInvoice.status === 'DRAFT' && (
                  <button
                    onClick={() => handleConfirmInvoice(selectedInvoice.id)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                )}
                {!isCustomer && selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleSendInvoice(selectedInvoice.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Send to Customer
                  </button>
                )}
                {!isCustomer && selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancelInvoice(selectedInvoice.id)}
                    className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Payment Allocation</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter payment details to allocate funds and update invoice status.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Invoice</label>
                <select
                  required
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Invoice...</option>
                  {invoices
                    .filter((i) => i.outstandingBalance > 0 && i.status !== 'CANCELLED')
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} — {i.customer.legalName} (Bal: ${i.outstandingBalance.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Allocate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer (ACH / Wire)</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / Digital</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-12903"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW QUOTATION MODAL */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Commercial Quotation</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select customer, plan, product, and optional variant (e.g. Odoo edition +$560).
            </p>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Start from Quotation Template (Optional)
                </label>
                <select
                  onChange={(e) => {
                    const tmplId = e.target.value;
                    if (!tmplId) return;
                    const tmpl = quotationTemplates.find((t) => t.id === tmplId);
                    if (tmpl) {
                      const firstLine = tmpl.lines?.[0];
                      setNewQuoteForm({
                        ...newQuoteForm,
                        planId: tmpl.planId || newQuoteForm.planId,
                        productId: firstLine?.productId || newQuoteForm.productId,
                        variantId: firstLine?.variantId || '',
                        quantity: firstLine?.quantity || 1,
                      });
                      showToast(`Applied template: ${tmpl.name}`);
                    }
                  }}
                  className="w-full rounded-lg border border-indigo-200 bg-indigo-50/50 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Start from Scratch...</option>
                  {quotationTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Valid {t.validityDays} days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer</label>
                <select
                  required
                  value={newQuoteForm.customerId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, customerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.legalName} ({c.billingEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subscription Plan</label>
                <select
                  required
                  value={newQuoteForm.planId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, planId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Plan...</option>
                  {plans.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} (${pl.price}/{pl.intervalUnit.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product</label>
                <select
                  required
                  value={newQuoteForm.productId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, productId: e.target.value, variantId: '' })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.salesPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {newQuoteForm.productId && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variant (Optional)</label>
                  <select
                    value={newQuoteForm.variantId}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, variantId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Base / Standard Edition</option>
                    {products
                      .find((p) => p.id === newQuoteForm.productId)
                      ?.variants?.map((v: any) => (
                        <option key={v.id} value={v.id}>
                          {v.attributeName}: {v.attributeValue} (+${v.priceDelta})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity / Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuoteForm.quantity}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={newQuoteForm.discountCode}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, discountCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD PRODUCT MODAL (ADMIN ONLY) */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Catalogue Product</h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure product details, sales price, internal cost price, and optional variant.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Helpdesk"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.salesPrice}
                    onChange={(e) => setProductForm({ ...productForm, salesPrice: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-2">Optional Variant Configuration:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Variant Value (e.g. Odoo Edition)"
                    value={productForm.variantValue}
                    onChange={(e) => setProductForm({ ...productForm, variantValue: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price Delta ($) e.g. 560"
                    value={productForm.variantDelta}
                    onChange={(e) => setProductForm({ ...productForm, variantDelta: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD PLAN MODAL (ADMIN ONLY) */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Subscription Plan</h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure cadence, base price, and lifecycle policy flags (PRD FR-04).
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarterly Growth"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interval</label>
                  <select
                    value={planForm.intervalUnit}
                    onChange={(e) => setPlanForm({ ...planForm, intervalUnit: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">Lifecycle Permissions:</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planForm.allowPause}
                    onChange={(e) => setPlanForm({ ...planForm, allowPause: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Allow Pausing</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planForm.allowEarlyClose}
                    onChange={(e) => setPlanForm({ ...planForm, allowEarlyClose: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Allow Early Cancellation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planForm.allowRenew}
                    onChange={(e) => setPlanForm({ ...planForm, allowRenew: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Allow Term Renewal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planForm.autoClose}
                    onChange={(e) => setPlanForm({ ...planForm, autoClose: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Auto-Close on Expiry Date</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: INVITE STAFF MODAL (ADMIN ONLY) */}
      {showStaffInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Invite Staff Member</h2>
            <p className="text-xs text-slate-500 mb-4">
              Admin-restricted staff invitation (PRD FR-01 & AT-03).
            </p>

            <form onSubmit={handleInviteStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Billing"
                  value={staffInviteForm.name}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@brightloop.io"
                  value={staffInviteForm.email}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  placeholder="Default: BrightStaff#2026"
                  value={staffInviteForm.temporaryPassword}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, temporaryPassword: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffInviteModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: SUBSCRIPTION DETAILS & HISTORY */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedSubscription.subscriptionNumber}</h2>
                <p className="text-xs text-slate-500">{selectedSubscription.customer.legalName}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  selectedSubscription.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedSubscription.status === 'PAUSED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {selectedSubscription.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Contract Lines</div>
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {selectedSubscription.items.map((i: any) => (
                    <div key={i.id} className="p-2.5 flex justify-between items-center bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{i.descriptionSnapshot}</div>
                        <div className="text-[11px] text-slate-500">Qty: {i.quantity} × ${i.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="font-bold text-slate-900">${i.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Lifecycle Status History</div>
                <div className="space-y-2">
                  {selectedSubscription.events?.map((e: any) => (
                    <div key={e.id} className="rounded-lg bg-slate-50 p-2 border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{e.fromStatus} → {e.toStatus}</span>
                        <span className="text-[10px] text-slate-400">{new Date(e.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        By {e.changedBy} {e.reason ? `• ${e.reason}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedSubscription(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: NEW DISCOUNT RULE (SCENE 5 - ADMIN ONLY) */}
      {showNewDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Discount Rule</h2>
            <p className="text-xs text-slate-500 mb-4">
              Admin-only configuration: fixed or percentage, seat minimums, validity dates, and usage limits (Scene 5).
            </p>

            <form onSubmit={handleCreateDiscountRule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEATS20"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono uppercase focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Volume Seat Discount"
                    value={discountForm.name}
                    onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder={discountForm.type === 'PERCENTAGE' ? 'e.g. 15 (%)' : 'e.g. 50 ($)'}
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Quantity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={discountForm.minQuantity}
                    onChange={(e) => setDiscountForm({ ...discountForm, minQuantity: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500"
                    value={discountForm.minAmount}
                    onChange={(e) => setDiscountForm({ ...discountForm, minAmount: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={discountForm.startsAt}
                    onChange={(e) => setDiscountForm({ ...discountForm, startsAt: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={discountForm.endsAt}
                    onChange={(e) => setDiscountForm({ ...discountForm, endsAt: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usage Limit (Max Times)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited if empty"
                    value={discountForm.usageLimit}
                    onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scope</label>
                  <select
                    value={discountForm.scopeType}
                    onChange={(e) => setDiscountForm({ ...discountForm, scopeType: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="ALL">Whole Subscription</option>
                    <option value="SPECIFIC_PRODUCTS">Specific Product Only</option>
                  </select>
                </div>
              </div>

              {discountForm.scopeType === 'SPECIFIC_PRODUCTS' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Target Product</label>
                  <select
                    value={discountForm.productId}
                    onChange={(e) => setDiscountForm({ ...discountForm, productId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a Product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDiscountModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Discount Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: CUSTOMER SIGN UP (SCENE 1) */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Customer Registration</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enforces normalized email uniqueness and strict password policy (&gt;8 chars, uppercase, lowercase, special char).
            </p>

            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="contact@apexdynamics.io"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 9 chars: Upper, lower & special char"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
                <div className="mt-1.5 space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${signUpForm.password.length >= 9 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span>{signUpForm.password.length >= 9 ? '✓' : '○'}</span>
                    <span>More than 8 characters ({signUpForm.password.length} chars)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(signUpForm.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span>{/[A-Z]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(signUpForm.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span>{/[a-z]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpForm.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one special character</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSignUpModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9B: NEW CUSTOMER ACCOUNT (ADMIN / STAFF) */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Customer Account</h2>
            <p className="text-xs text-slate-500 mb-4">
              Register commercial account with billing profile, tax identifiers, and optional portal credentials.
            </p>

            <form onSubmit={handleCreateCustomerAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Legal Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={customerForm.legalName}
                  onChange={(e) => setCustomerForm({ ...customerForm, legalName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  required
                  placeholder="billing@apexdynamics.io"
                  value={customerForm.billingEmail}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingEmail: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tax / VAT ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. US-TAX-7788"
                    value={customerForm.taxId}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={customerForm.currency}
                    onChange={(e) => setCustomerForm({ ...customerForm, currency: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  placeholder="123 Innovation Way, Suite 400"
                  value={customerForm.billingAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Portal Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty or min 9 chars: Upper, lower, special"
                  value={customerForm.password}
                  onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  If set, enables self-service customer portal login with this email.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: FORGOT PASSWORD (SCENE 1) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Reset Password Link</h2>
            <p className="text-xs text-slate-500 mb-4">
              Scene 1: If a customer forgets their password, a secure single-use reset link arrives at their registered email.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="john@acme.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {resetResult && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs">
                  <div className="font-bold text-blue-900 mb-1">Reset Token / Link Generated:</div>
                  <div className="font-mono text-[11px] text-blue-700 break-all select-all bg-white p-2 rounded border border-blue-100">
                    {resetResult}
                  </div>
                  <p className="text-[10px] text-blue-500 mt-1.5">
                    In production, this is emailed with a secure single-use expiry token.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetResult(null);
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Generating...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
