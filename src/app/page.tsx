'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import EditPlanModal from '@/components/modals/EditPlanModal';
import EditProductModal from '@/components/modals/EditProductModal';
import EditCustomerModal from '@/components/modals/EditCustomerModal';
import EditTaxModal from '@/components/modals/EditTaxModal';
import NewTaxModal from '@/components/modals/NewTaxModal';
import EditDiscountModal from '@/components/modals/EditDiscountModal';
import EditSubscriptionModal from '@/components/modals/EditSubscriptionModal';
import VoidPaymentModal from '@/components/modals/VoidPaymentModal';
import {
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
  DollarSign,
  ArrowUpRight,
  Clock,
  Send,
  Ban,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';
import Sidebar, { TabId } from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardCharts from '@/components/DashboardCharts';
import WelcomeCard from '@/components/WelcomeCard';
import LandingPage from '@/components/LandingPage';
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  SpotlightCard,
  ScaleButton,
} from '@/components/motion/MotionWrapper';

interface AuthPrincipal {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  name?: string | null;
  customerAccountId?: string | null;
}

export default function SMSApplication() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentView, setCurrentView] = useState<'app' | 'landing'>('app');

  // Synchronize state with URL parameters on mount and browser navigation (Back / Forward)
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const tabParam = params.get('tab') as TabId | null;

      if (viewParam === 'landing') {
        setCurrentView('landing');
      } else if (tabParam) {
        setActiveTab(tabParam);
        setCurrentView('app');
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Change tab and synchronize browser URL without full-page reload
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setCurrentView('app');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      url.searchParams.delete('view');
      window.history.pushState({ tab: tabId, view: 'app' }, '', url.toString());
    }
  };

  // Switch to public landing page and update URL
  const handleShowLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'landing');
      url.searchParams.delete('tab');
      window.history.pushState({ view: 'landing' }, '', url.toString());
    }
  };

  // Launch application console from landing page
  const handleEnterApp = (targetTab: TabId = 'dashboard') => {
    setCurrentView('app');
    handleTabChange(targetTab);
  };
  const [currentUser, setCurrentUser] = useState<AuthPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
  const [quotationTemplates, setQuotationTemplates] = useState<any[]>([]);

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
  // Modal Edit states
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingTaxRule, setEditingTaxRule] = useState<any>(null);
  const [showNewTaxModal, setShowNewTaxModal] = useState(false);
  const [editingDiscountRule, setEditingDiscountRule] = useState<any>(null);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [voidingPayment, setVoidingPayment] = useState<any>(null);
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
    const initAuth = async () => {
      try {
        const meRes = await fetch('/api/v1/auth/me');
        const meData = await meRes.json();
        if (meData.success && meData.data?.user) {
          setCurrentUser(meData.data.user);
          await refreshAllData(meData.data.user);
          setLoading(false);
          return;
        }
      } catch (_) {}
      switchUser('admin@brightloop.io');
    };
    initAuth();
  }, []);
  // Global Escape key listener to dismiss any active modal instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInvoice(null);
        setSelectedSubscription(null);
        setShowPaymentModal(false);
        setShowNewQuoteModal(false);
        setShowNewProductModal(false);
        setShowNewPlanModal(false);
        setShowStaffInviteModal(false);
        setShowNewDiscountModal(false);
        setShowSignUpModal(false);
        setShowForgotModal(false);
        setShowNewCustomerModal(false);
        setEditingPlan(null);
        setEditingProduct(null);
        setEditingCustomer(null);
        setEditingTaxRule(null);
        setShowNewTaxModal(false);
        setEditingDiscountRule(null);
        setEditingSubscription(null);
        setVoidingPayment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
    else toast.info(message);
    setNotification({ type: type === 'error' ? 'error' : 'success', message });
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

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      showToast('Logged out successfully.');
    } catch (_) {}
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
      if (sub.success) setSubscriptions(sub.data.subscriptions || []);
      if (inv.success) setInvoices(inv.data.invoices || []);
      if (pay.success) setPayments(pay.data.payments || []);
      if (qt.success) setQuotations(qt.data.quotations || []);
      if (prod.success) setProducts(prod.data.products || []);
      if (pl.success) setPlans(pl.data.plans || []);
      if (cust.success) setCustomers(cust.data.customers || []);
      if (tmpl && tmpl.success) setQuotationTemplates(tmpl.data.templates || []);

      if (user && user.role !== 'CUSTOMER') {
        const [tx, ds, users, audit] = await Promise.all([
          get('/api/v1/tax-rules'),
          get('/api/v1/discount-rules'),
          get('/api/v1/users'),
          get('/api/v1/audit-logs'),
        ]);
        if (tx.success) setTaxRules(tx.data.taxRules || []);
        if (ds.success) setDiscountRules(ds.data.discountRules || []);
        if (users.success) setStaffUsers(users.data.users || []);
        if (audit.success) setAuditLogs(audit.data.auditLogs || []);
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

  // Confirm Invoice
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
          notes: productForm.notes || undefined,
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
          minQuantity: Number(planForm.minQuantity || 1),
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

  // Create Discount Rule
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
        showToast(`Discount Rule ${data.data.discountRule.code} created!`);
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

  // Customer Sign-Up
  
  // Delete Plan
  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate plan "${planName}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/plans/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || `Plan "${planName}" processed.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete plan', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${productName}" and all associated variants?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Product "${productName}" deleted successfully.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Customer Account
  const handleDeleteCustomer = async (customerId: string, legalName: string) => {
    if (!window.confirm(`Are you sure you want to delete customer account "${legalName}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/customers/${customerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Customer account "${legalName}" removed.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete customer', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Tax Rule
  const handleDeleteTaxRule = async (taxId: string, taxName: string) => {
    if (!window.confirm(`Are you sure you want to delete tax rule "${taxName}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/tax-rules/${taxId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Tax rule "${taxName}" deleted.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete tax rule', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Discount Rule
  const handleDeleteDiscountRule = async (ruleId: string, ruleCode: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon rule "${ruleCode}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/discount-rules/${ruleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Discount rule "${ruleCode}" deleted.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete discount rule', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete / Close Subscription
  const handleDeleteSubscription = async (subId: string, subNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete or close subscription ${subNumber}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/subscriptions/${subId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || `Subscription ${subNumber} processed.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete subscription', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (invId: string, invNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete draft invoice ${invNumber}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${invId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice ${invNumber} deleted successfully.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete invoice', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Quotation
  const handleCancelQuotation = async (quoteId: string, quoteNumber: string) => {
    if (!window.confirm(`Mark quotation ${quoteNumber} as CANCELLED?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/quotations/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Quotation ${quoteNumber} cancelled.`, 'info');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to cancel quotation', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Quotation
  const handleDeleteQuotation = async (quoteId: string, quoteNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${quoteNumber}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/quotations/${quoteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Quotation ${quoteNumber} deleted.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete quotation', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Payment
  const handleDeletePayment = async (paymentId: string, paymentRef: string) => {
    if (!window.confirm(`Are you sure you want to delete payment ${paymentRef}? Invoice balances will be reconciled.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/payments/${paymentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment ${paymentRef} record deleted.`, 'success');
        await refreshAllData();
      } else {
        showToast(data.error || 'Failed to delete payment', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

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
        showToast(`Account successfully created for ${signUpForm.email}! Switched to customer portal.`);
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

  // Forgot Password
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

  // Invite Staff
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/staff/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffInviteForm.email,
          name: staffInviteForm.name,
          temporaryPassword: staffInviteForm.temporaryPassword || 'BrightStaff#2026',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Staff member "${staffInviteForm.name}" invited successfully!`);
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

  // Filtered queries based on searchTerm
  const filterBySearch = (items: any[], fields: string[]) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) =>
      fields.some((f) => {
        const val = f.split('.').reduce((obj, key) => obj?.[key], item);
        return String(val || '').toLowerCase().includes(term);
      })
    );
  };

  const filteredSubscriptions = filterBySearch(subscriptions, ['subscriptionNumber', 'customer.legalName', 'plan.name', 'status']);
  const filteredInvoices = filterBySearch(invoices, ['invoiceNumber', 'customer.legalName', 'status']);
  const filteredCustomers = filterBySearch(customers, ['legalName', 'billingEmail', 'taxId']);
  const filteredQuotes = filterBySearch(quotations, ['quoteNumber', 'customer.legalName', 'plan.name', 'status']);
  const filteredPayments = filterBySearch(payments, ['reference', 'paymentMethod', 'customer.legalName']);

  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} plans={plans} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* 1. Sleek Modern Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onShowLanding={handleShowLanding}
        currentUser={currentUser}
        onSwitchUser={switchUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        stats={{
          activeSubs: overview?.metrics?.activeSubscriptionsCount || subscriptions.filter((s) => s.status === 'ACTIVE').length,
          overdueInvoices: overview?.metrics?.overdueInvoicesCount || 0,
          totalCustomers: customers.length,
        }}
      />

      {/* 2. Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Header */}
        <Header
          activeTab={activeTab}
          onShowLanding={handleShowLanding}
          currentUser={currentUser}
          onSwitchUser={switchUser}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onTriggerBilling={handleTriggerBilling}
          onOpenNewQuote={() => setShowNewQuoteModal(true)}
          onOpenSignUp={() => setShowSignUpModal(true)}
          onOpenForgot={() => setShowForgotModal(true)}
          actionLoading={actionLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifications={
            overview?.overdueInvoices?.length > 0
              ? [
                  {
                    id: 'overdue-1',
                    title: `${overview.metrics.overdueInvoicesCount} Invoices Overdue`,
                    message: `Total overdue receivables: $${overview.metrics.overdueTotalValue.toLocaleString()}`,
                    createdAt: new Date(),
                  },
                  {
                    id: 'sub-active',
                    title: 'Billing Run Synced',
                    message: `${subscriptions.filter((s) => s.status === 'ACTIVE').length} active subscriptions scheduled for billing.`,
                    createdAt: new Date(),
                  },
                ]
              : [
                  {
                    id: 'all-good',
                    title: 'System Operational',
                    message: 'All subscriptions and invoices are in sync.',
                    createdAt: new Date(),
                  },
                ]
          }
        />

        {/* Floating Toast Notification */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl transition-all duration-300 border ${
              notification.type === 'success'
                ? 'bg-card text-foreground border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-card text-destructive border-destructive/40 shadow-destructive/10'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            )}
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <PageTransition currentKey={activeTab}>
          {/* ========================================================================= */}
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && overview && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <WelcomeCard
                title={`Welcome back, ${currentUser?.name || 'Administrator'}!`}
                subtitle={
                  isCustomer
                    ? 'Manage your recurring subscriptions, invoices, and payment history.'
                    : 'Real-time overview of monthly recurring revenue, active subscriptions, and cash collections.'
                }
              />

              {/* KPI Cards Grid */}
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MRR Card */}
                <StaggerItem>
                  <SpotlightCard className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-semibold uppercase tracking-wider font-display">Monthly Recurring (MRR)</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display">
                        <AnimatedCounter value={overview.metrics.mrr} prefix="$" />
                      </span>
                      <span className="flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        <ArrowUpRight className="h-3 w-3" /> +14.2%
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Annual Run Rate: <strong className="text-foreground font-mono tabular-nums">${overview.metrics.arr.toLocaleString()}</strong>
                    </div>
                  </SpotlightCard>
                </StaggerItem>

                {/* Active Subscriptions Card */}
                <StaggerItem>
                  <SpotlightCard className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-semibold uppercase tracking-wider font-display">Active Subscriptions</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Layers className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display">
                        <AnimatedCounter value={overview.metrics.activeSubscriptionsCount} />
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        contracted
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Avg seats/contract: <strong className="text-foreground font-mono">4.8 seats</strong>
                    </div>
                  </SpotlightCard>
                </StaggerItem>

                {/* Cash Collected Card */}
                <StaggerItem>
                  <SpotlightCard className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-xs font-semibold uppercase tracking-wider font-display">Cash Realized</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <CreditCard className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-display">
                        <AnimatedCounter value={overview.metrics.cashCollected} prefix="$" />
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Settled
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Total Invoiced: <strong className="text-foreground font-mono tabular-nums">${overview.metrics.totalBilled.toLocaleString()}</strong>
                    </div>
                  </SpotlightCard>
                </StaggerItem>

                {/* Overdue Receivables Card */}
                <StaggerItem>
                  <SpotlightCard className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-sm transition hover:border-rose-500/40">
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                      <span className="text-xs font-semibold uppercase tracking-wider font-display">Overdue Receivables</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight font-display">
                        <AnimatedCounter value={overview.metrics.overdueTotalValue} prefix="$" />
                      </span>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                        ({overview.metrics.overdueInvoicesCount} invoices)
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Requires collection follow-up
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              </StaggerContainer>

              {/* Data Visualizations (Recharts) */}
              <DashboardCharts
                mrr={overview.metrics.mrr}
                arr={overview.metrics.arr}
                cashCollected={overview.metrics.cashCollected}
                outstandingBalance={overview.metrics.outstandingBalance}
                subscriptions={subscriptions}
                invoices={invoices}
              />

              {/* Overdue Receivables Priority Action Center */}
              {overview.overdueInvoices.length > 0 && !isCustomer && (
                <div className="rounded-2xl border border-rose-500/25 bg-card p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        <h2 className="text-sm font-bold text-foreground font-display tracking-tight">Priority Overdue Collections</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Invoices past due with unpaid balance requiring commercial action.
                      </p>
                    </div>
                    <span className="rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 text-xs font-bold border border-rose-500/20 font-mono">
                      {overview.overdueInvoices.length} Overdue
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase font-display text-[11px] tracking-wider">
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
                      <tbody className="divide-y divide-border">
                        {overview.overdueInvoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-foreground">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4 text-foreground font-medium">{inv.customerName}</td>
                            <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                              {new Date(inv.dueAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-mono tabular-nums font-semibold">${inv.grandTotal.toFixed(2)}</td>
                            <td className="py-3 px-4 font-mono tabular-nums text-muted-foreground">${inv.amountPaid.toFixed(2)}</td>
                            <td className="py-3 px-4 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
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
                                    note: 'Overdue collection payment',
                                  });
                                  setShowPaymentModal(true);
                                }}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow hover:bg-emerald-700 transition"
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

          {/* ========================================================================= */}
          {/* TAB 2: SUBSCRIPTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {isCustomer ? 'My Subscriptions' : 'Subscriptions Management'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Lifecycle states: Draft → Quotation → Confirmed → Active → Closed (with Pause/Resume & Renewal terms).
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => setShowNewQuoteModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create via Quotation</span>
                  </button>
                )}
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
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
                    <tbody className="divide-y divide-border">
                      {filteredSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No subscriptions found matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredSubscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground font-mono">{sub.subscriptionNumber}</td>
                            <td className="py-3 px-4 text-foreground font-medium">{sub.customer.legalName}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-foreground">{sub.plan.name}</span>
                              <span className="ml-1 text-[11px] text-muted-foreground">({sub.plan.intervalUnit})</span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  sub.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : sub.status === 'PAUSED'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : 'bg-muted text-muted-foreground border border-border'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(sub.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedSubscription(sub)}
                                className="rounded-lg border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-accent transition"
                              >
                                Details
                              </button>

                              {sub.status === 'ACTIVE' && sub.allowPause && sub.plan.allowPause && (
                                <button
                                  onClick={() => handleSubAction(sub.id, 'PAUSE')}
                                  className="rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 font-semibold hover:bg-amber-500/20 transition"
                                >
                                  Pause
                                </button>
                              )}

                              {sub.status === 'PAUSED' && (
                                <button
                                  onClick={() => handleSubAction(sub.id, 'RESUME')}
                                  className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 font-semibold hover:bg-emerald-700 transition"
                                >
                                  Resume
                                </button>
                              )}

                              {sub.status !== 'CLOSED' && sub.allowEarlyClose && sub.plan.allowEarlyClose && (
                                <button
                                  onClick={() => handleSubAction(sub.id, 'CLOSE')}
                                  className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-2.5 py-1 font-semibold hover:bg-destructive/20 transition"
                                >
                                  Close
                                </button>
                              )}

                              {sub.status !== 'CLOSED' && sub.allowRenew && sub.plan.allowRenew && (
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
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: INVOICES & BILLING */}
          {/* ========================================================================= */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {isCustomer ? 'My Invoices' : 'Invoices & Billing Schedule'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Immutable snapshots of products, variants, taxes, and applied discounts.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={handleTriggerBilling}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run Billing Day Batch</span>
                  </button>
                )}
              </div>

              {/* Invoices Table */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
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
                    <tbody className="divide-y divide-border">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No invoices found.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground font-mono">{inv.invoiceNumber}</td>
                            <td className="py-3 px-4 text-foreground font-medium">{inv.customer.legalName}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(inv.periodStart).toLocaleDateString()} – {new Date(inv.periodEnd).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  inv.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : inv.status === 'PARTIALLY_PAID'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : inv.status === 'CANCELLED'
                                    ? 'bg-muted text-muted-foreground border border-border'
                                    : inv.isOverdue
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                {inv.isOverdue ? 'OVERDUE' : inv.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-foreground">${inv.grandTotal.toFixed(2)}</td>
                            <td className="py-3 px-4 font-semibold text-muted-foreground">${inv.outstandingBalance.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="rounded-lg border border-border bg-card px-2.5 py-1 font-semibold text-foreground hover:bg-accent transition"
                              >
                                View / Print
                              </button>
                              {!isCustomer && inv.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleConfirmInvoice(inv.id)}
                                  className="rounded-lg bg-blue-600 px-2 py-1 font-semibold text-white hover:bg-blue-700 transition"
                                >
                                  Confirm
                                </button>
                              )}
                              {!isCustomer && inv.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleSendInvoice(inv.id)}
                                  className="rounded-lg bg-indigo-600 px-2 py-1 font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                  Send
                                </button>
                              )}
                              {inv.outstandingBalance > 0 && inv.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => {
                                    setPaymentForm({
                                      invoiceId: inv.id,
                                      amount: inv.outstandingBalance.toString(),
                                      method: 'CREDIT_CARD',
                                      reference: '',
                                      note: isCustomer ? 'Customer portal online payment' : '',
                                    });
                                    setShowPaymentModal(true);
                                  }}
                                  className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 transition"
                                >
                                  {isCustomer ? 'Pay Invoice' : 'Pay'}
                                </button>
                              )}
                              {!isCustomer && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
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
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PAYMENTS & RECONCILIATION */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {isCustomer ? 'My Payment Receipts' : 'Payments & Reconciliation'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Multi-invoice allocations, payment methods, transaction references, and void capabilities.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => {
                      setPaymentForm({ invoiceId: '', amount: '', method: 'CREDIT_CARD', reference: '', note: '' });
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              {/* Payments Table */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Payment Ref</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Allocated Invoices</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No payment transactions recorded.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground font-mono">{p.reference || p.id.slice(0, 8)}</td>
                            <td className="py-3 px-4 text-foreground font-medium">{p.customer?.legalName || 'Direct'}</td>
                            <td className="py-3 px-4 font-semibold text-muted-foreground">{p.paymentMethod}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                              ${p.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {p.allocations?.map((a: any) => a.invoice?.invoiceNumber).join(', ') || 'Unallocated'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  p.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }`}
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: QUOTATIONS & OFFERS */}
          {/* ========================================================================= */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {isCustomer ? 'My Quotations' : 'Quotations & Commercial Offers'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reusable templates, variant pricing adjustments (e.g. Odoo brand +$560), and 1-click subscription conversion.
                  </p>
                </div>
                {!isCustomer && (
                  <button
                    onClick={() => setShowNewQuoteModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Quotation</span>
                  </button>
                )}
              </div>

              {/* Quotations Table */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
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
                    <tbody className="divide-y divide-border">
                      {filteredQuotes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No quotations found.
                          </td>
                        </tr>
                      ) : (
                        filteredQuotes.map((qt) => (
                          <tr key={qt.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground font-mono">{qt.quoteNumber}</td>
                            <td className="py-3 px-4 text-foreground font-medium">{qt.customer.legalName}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{qt.plan?.name || '—'}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  qt.status === 'CONFIRMED'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                {qt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{new Date(qt.expiryDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-bold text-foreground">${qt.total.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
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
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: CUSTOMER ACCOUNTS */}
          {/* ========================================================================= */}
          {activeTab === 'customers' && !isCustomer && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Customer Accounts & Organizations</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Commercial profiles, legal names, billing emails, and currency settings.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Customer Account</span>
                </button>
              </div>

              {/* Customers Table */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Legal Business Name</th>
                        <th className="py-3 px-4">Billing Email</th>
                        <th className="py-3 px-4">Tax / VAT ID</th>
                        <th className="py-3 px-4">Billing Address</th>
                        <th className="py-3 px-4">Currency</th>
                        <th className="py-3 px-4">Active Subscriptions</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No customers found.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => (
                          <tr key={c.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground">{c.legalName}</td>
                            <td className="py-3 px-4 text-primary font-medium">{c.billingEmail}</td>
                            <td className="py-3 px-4 text-muted-foreground">{c.taxId || '—'}</td>
                            <td className="py-3 px-4 text-muted-foreground">{c.billingAddress || '—'}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{c.currency}</td>
                            <td className="py-3 px-4">
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: PLANS & CADENCE */}
          {/* ========================================================================= */}
          {activeTab === 'plans' && !isCustomer && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Subscription Plans & Billing Cadence</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Plan pricing intervals (Daily, Weekly, Monthly, Yearly) and lifecycle rule permissions.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewPlanModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Plan</span>
                  </button>
                )}
              </div>

              {/* Plans Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((pl) => (
                  <div key={pl.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between transition hover:border-primary/40">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {pl.intervalUnit}
                        </span>
                        <span className="text-[11px] text-muted-foreground">Min: {pl.minQuantity} seats</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{pl.name}</h3>
                      <div className="text-2xl font-black text-foreground mt-2">
                        ${pl.price.toFixed(2)}{' '}
                        <span className="text-xs font-medium text-muted-foreground">
                          / {pl.intervalUnit.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border space-y-2 text-xs">
                      <div className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
                        Lifecycle Policies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pl.allowPause ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                          {pl.allowPause ? '✓ Allow Pause' : '✕ No Pause'}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pl.allowEarlyClose ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                          {pl.allowEarlyClose ? '✓ Early Close' : '✕ Fixed Term'}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${pl.allowRenew ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                          {pl.allowRenew ? '✓ Renewable' : '✕ Auto-End'}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: PRODUCTS & VARIANTS CATALOG */}
          {/* ========================================================================= */}
          {activeTab === 'catalog' && !isCustomer && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Products & Variants Catalog</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Catalog management with variant differential pricing (e.g. Odoo brand +$560.00) and cost protection.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewProductModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                )}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between transition hover:border-primary/40">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {p.type}
                        </span>
                        <span className="text-xs font-bold text-foreground">${p.salesPrice.toFixed(2)}</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                      {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Brand / Edition Variants
                      </div>
                      {p.variants?.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Base product only</span>
                      ) : (
                        <div className="space-y-1">
                          {p.variants.map((v: any) => (
                            <div key={v.id} className="flex justify-between items-center text-xs p-1.5 rounded bg-muted/50">
                              <span className="font-medium text-foreground">{v.attributeName}: {v.attributeValue}</span>
                              <span className="font-bold text-primary">
                                {v.priceDelta >= 0 ? `+$${v.priceDelta.toFixed(2)}` : `-$${Math.abs(v.priceDelta).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: TAXES & DISCOUNT RULES */}
          {/* ========================================================================= */}
          {activeTab === 'discounts' && !isCustomer && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Tax Rates & Discount Rules</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatic tax calculation and admin-managed coupons with seat minimums & usage limits.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowNewDiscountModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Discount Rule</span>
                  </button>
                )}
              </div>

              {/* Tax Rates */}
              <div className="space-y-3">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {taxRules.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-sm">{t.name}</span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                          {t.jurisdiction}
                        </span>
                      </div>
                      <div className="text-3xl font-black text-primary mt-2">{t.rate}%</div>
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Rules */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Configured Discount Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discountRules.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                            {d.code}
                          </span>
                          <h4 className="font-semibold text-foreground text-sm mt-2">{d.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-foreground">
                            {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `$${d.value.toFixed(2)} OFF`}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            Usage: {d.usageCount} / {d.usageLimit || '∞'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Scope: {d.scopeType}</span>
                        <span>{d.minAmount ? `Min: ${d.minAmount}` : 'No min spend'}</span>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: ANALYTICS & REVENUE REPORTS */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && !isCustomer && overview && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Revenue Analytics & Financial Performance</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Executive metrics, monthly recurring revenue run-rate, cash collection efficiency, and raw export center.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/api/v1/reports/export?entity=invoices"
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition"
                  >
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Invoices CSV</span>
                  </a>
                  <a
                    href="/api/v1/reports/export?entity=subscriptions"
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-accent transition"
                  >
                    <FileDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Subs CSV</span>
                  </a>
                </div>
              </div>

              {/* Analytics Charts */}
              <DashboardCharts
                mrr={overview.metrics.mrr}
                arr={overview.metrics.arr}
                cashCollected={overview.metrics.cashCollected}
                outstandingBalance={overview.metrics.outstandingBalance}
                subscriptions={subscriptions}
                invoices={invoices}
              />

              {/* Financial Metrics Summary Table */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground">SaaS Revenue Run-Rate Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground font-medium">Monthly Recurring Revenue (MRR)</span>
                    <div className="text-2xl font-black text-foreground mt-1">${overview.metrics.mrr.toLocaleString()}</div>
                    <span className="text-[11px] text-muted-foreground">Normalized active run-rate</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground font-medium">Annual Recurring Revenue (ARR)</span>
                    <div className="text-2xl font-black text-foreground mt-1">${overview.metrics.arr.toLocaleString()}</div>
                    <span className="text-[11px] text-muted-foreground">MRR × 12 annualized</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground font-medium">Realized Cash Collections</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${overview.metrics.cashCollected.toLocaleString()}</div>
                    <span className="text-[11px] text-muted-foreground">Settled payment allocations</span>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground font-medium">Outstanding Accounts Receivable</span>
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${overview.metrics.outstandingBalance.toLocaleString()}</div>
                    <span className="text-[11px] text-muted-foreground">Unpaid / partially paid balance</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 11: AUDIT TRAIL */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && !isCustomer && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Append-Only Audit Trail & Compliance</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tamper-evident record of all billing batches, invoice state transitions, payments, and policy changes.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Target Entity</th>
                        <th className="py-3 px-4">Actor ID / User</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Diff Snapshot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No audit trail logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-accent/40 transition">
                            <td className="py-3 px-4 font-bold text-foreground">
                              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-foreground font-medium">{log.entityType} ({log.entityId.slice(0, 8)})</td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">{log.actorUserId ? log.actorUserId.slice(0, 8) : 'SYSTEM'}</td>
                            <td className="py-3 px-4 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground truncate max-w-xs">
                              {JSON.stringify(log.afterJson || log.beforeJson || {})}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: SETTINGS & TEAM MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Platform Settings & Team Management</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Role assignments, staff onboarding, security password policies, and system preferences.
                </p>
              </div>

              {/* Staff Management (Admin only) */}
              {!isCustomer && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Internal Team & Staff Members</h3>
                      <p className="text-xs text-muted-foreground">Users with administrative or operational authority.</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => setShowStaffInviteModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Invite Staff</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase">
                        <tr>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Role</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {staffUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-accent/40 transition">
                            <td className="py-2.5 px-4 font-bold text-foreground">{u.name || 'Staff User'}</td>
                            <td className="py-2.5 px-4 text-muted-foreground">{u.emailNormalized}</td>
                            <td className="py-2.5 px-4">
                              <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-secondary text-secondary-foreground">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Security Policy Panel */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-foreground">Security Policy & Role Enforcement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="font-semibold text-foreground">Password Complexity</div>
                    <div className="text-muted-foreground mt-1">Minimum 9 characters, uppercase, lowercase, and special characters strictly enforced.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="font-semibold text-foreground">Normalized Email Integrity</div>
                    <div className="text-muted-foreground mt-1">Case-insensitive uniqueness enforced directly in the database engine.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                    <div className="font-semibold text-foreground">Customer Data Isolation</div>
                    <div className="text-muted-foreground mt-1">Customer profiles are locked to their own tenant record (PRD AT-04).</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </PageTransition>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS & OVERLAYS */}
      {/* ========================================================================= */}

      {/* MODAL 1: PRINTABLE INVOICE VIEW */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedInvoice(null); }}
        >
          <div className="w-full max-w-2xl my-8 rounded-2xl border border-border bg-card p-8 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow">
                    B
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">Brightloop Software</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Tax ID: US-EIN-992014 | billing@brightloop.io</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground font-mono">{selectedInvoice.invoiceNumber}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      selectedInvoice.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : selectedInvoice.isOverdue
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {selectedInvoice.isOverdue ? 'OVERDUE' : selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Billed To:</span>
                <div className="font-bold text-foreground text-sm mt-1">{selectedInvoice.customer?.legalName}</div>
                <div className="text-muted-foreground">{selectedInvoice.customer?.billingEmail}</div>
                <div className="text-muted-foreground">{selectedInvoice.customer?.billingAddress}</div>
                {selectedInvoice.customer?.taxId && (
                  <div className="text-muted-foreground mt-1">Tax/VAT: {selectedInvoice.customer.taxId}</div>
                )}
              </div>
              <div className="space-y-1 text-right">
                <div>
                  <span className="text-muted-foreground">Issue Date:</span>{' '}
                  <strong className="text-foreground">{new Date(selectedInvoice.issuedAt).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>{' '}
                  <strong className="text-foreground">{new Date(selectedInvoice.dueAt).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing Period:</span>{' '}
                  <strong className="text-foreground">
                    {new Date(selectedInvoice.periodStart).toLocaleDateString()} – {new Date(selectedInvoice.periodEnd).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-4">Item Snapshot Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Tax</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedInvoice.lines?.map((l: any) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-4 font-medium text-foreground">{l.descriptionSnapshot}</td>
                      <td className="py-2.5 px-4 text-center">{l.quantity}</td>
                      <td className="py-2.5 px-4 text-right">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right text-muted-foreground">
                        {l.taxRate}% (${l.taxAmount.toFixed(2)})
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-foreground">${l.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-6 text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount Applied:</span>
                    <span>- ${selectedInvoice.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax Total:</span>
                  <span>+ ${selectedInvoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm font-extrabold text-foreground">
                  <span>Grand Total:</span>
                  <span>${selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Amount Paid:</span>
                  <span>${selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between text-sm font-bold text-primary">
                  <span>Outstanding Balance:</span>
                  <span>${selectedInvoice.outstandingBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Invoice</span>
                </button>
                {selectedInvoice.outstandingBalance > 0 && selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      setPaymentForm({
                        invoiceId: selectedInvoice.id,
                        amount: selectedInvoice.outstandingBalance.toString(),
                        method: 'CREDIT_CARD',
                        reference: '',
                        note: isCustomer ? 'Customer portal online payment' : '',
                      });
                      setSelectedInvoice(null);
                      setShowPaymentModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Pay Now (${selectedInvoice.outstandingBalance.toFixed(2)})</span>
                  </button>
                )}
                {!isCustomer && selectedInvoice.status === 'DRAFT' && (
                  <button
                    onClick={() => handleConfirmInvoice(selectedInvoice.id)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Confirm
                  </button>
                )}
                {!isCustomer && selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleSendInvoice(selectedInvoice.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    Send to Customer
                  </button>
                )}
                {!isCustomer && selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancelInvoice(selectedInvoice.id)}
                    className="rounded-lg border border-rose-200 dark:border-rose-900 bg-card px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Record Payment Allocation</h2>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter payment details to allocate funds and update invoice status.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Target Invoice</label>
                <select
                  required
                  value={paymentForm.invoiceId}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: e.target.value,
                      amount: inv ? inv.outstandingBalance.toString() : paymentForm.amount,
                    });
                  }}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select an Invoice...</option>
                  {invoices
                    .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.customer.legalName} (Bal: ${inv.outstandingBalance.toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="CHECK">Check</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-2026-9901"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add optional internal receipt notes..."
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NEW QUOTATION MODAL */}
      {showNewQuoteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewQuoteModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Create Commercial Quotation</h2>
              <button
                type="button"
                onClick={() => setShowNewQuoteModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Select customer, plan, product, and optional variant (e.g. Odoo edition +$560).
            </p>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
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
                  className="w-full rounded-lg border border-primary/30 bg-primary/5 p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
                <label className="block font-semibold text-foreground mb-1">Customer</label>
                <select
                  required
                  value={newQuoteForm.customerId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, customerId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
                <label className="block font-semibold text-foreground mb-1">Subscription Plan</label>
                <select
                  required
                  value={newQuoteForm.planId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, planId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
                <label className="block font-semibold text-foreground mb-1">Product</label>
                <select
                  required
                  value={newQuoteForm.productId}
                  onChange={(e) => setNewQuoteForm({ ...newQuoteForm, productId: e.target.value, variantId: '' })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
                  <label className="block font-semibold text-foreground mb-1">Variant (Optional)</label>
                  <select
                    value={newQuoteForm.variantId}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, variantId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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
                  <label className="block font-semibold text-foreground mb-1">Quantity / Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuoteForm.quantity}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Discount Code</label>
                  <input
                    type="text"
                    placeholder="e.g. VOLUME10"
                    value={newQuoteForm.discountCode}
                    onChange={(e) => setNewQuoteForm({ ...newQuoteForm, discountCode: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground uppercase focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: NEW PRODUCT MODAL */}
      {showNewProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewProductModal(false); }}
        >
          <div className="w-full max-w-md my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Add Product to Catalog</h2>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Configure product details, sales price, cost price, and optional variants.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Security Addon"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Product Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="499.00"
                    value={productForm.salesPrice}
                    onChange={(e) => setProductForm({ ...productForm, salesPrice: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Cost Price ($) (Internal Only)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={productForm.costPrice}
                  onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <span className="font-bold text-foreground text-[11px] block">Optional Variant (e.g. Odoo Edition +560)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Attribute Value (e.g. Odoo)"
                    value={productForm.variantValue}
                    onChange={(e) => setProductForm({ ...productForm, variantValue: e.target.value })}
                    className="rounded-lg border border-input bg-background p-1.5 text-xs text-foreground"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price Delta ($) (e.g. 560)"
                    value={productForm.variantDelta}
                    onChange={(e) => setProductForm({ ...productForm, variantDelta: e.target.value })}
                    className="rounded-lg border border-input bg-background p-1.5 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: NEW PLAN MODAL */}
      {showNewPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewPlanModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Create Billing Plan</h2>
              <button
                type="button"
                onClick={() => setShowNewPlanModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Configure billing cadence and subscription lifecycle policy rules.
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Monthly"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="199.00"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Cadence / Interval</label>
                  <select
                    value={planForm.intervalUnit}
                    onChange={(e) => setPlanForm({ ...planForm, intervalUnit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-bold text-foreground text-[11px] block">Lifecycle Policy Controls</span>
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={planForm.allowPause}
                    onChange={(e) => setPlanForm({ ...planForm, allowPause: e.target.checked })}
                    className="rounded border-input text-primary"
                  />
                  <span>Allow Customer / Team to Pause</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={planForm.allowEarlyClose}
                    onChange={(e) => setPlanForm({ ...planForm, allowEarlyClose: e.target.checked })}
                    className="rounded border-input text-primary"
                  />
                  <span>Allow Early Termination</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={planForm.allowRenew}
                    onChange={(e) => setPlanForm({ ...planForm, allowRenew: e.target.checked })}
                    className="rounded border-input text-primary"
                  />
                  <span>Allow Term Renewals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={planForm.autoClose}
                    onChange={(e) => setPlanForm({ ...planForm, autoClose: e.target.checked })}
                    className="rounded border-input text-primary"
                  />
                  <span>Auto-Close on Expiry Date</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: INVITE STAFF MODAL */}
      {showStaffInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowStaffInviteModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Invite Staff Member</h2>
              <button
                type="button"
                onClick={() => setShowStaffInviteModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Admin-restricted staff invitation (PRD FR-01 & AT-03).
            </p>

            <form onSubmit={handleInviteStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Billing"
                  value={staffInviteForm.name}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="alex@brightloop.io"
                  value={staffInviteForm.email}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Temporary Password</label>
                <input
                  type="password"
                  placeholder="Default: BrightStaff#2026"
                  value={staffInviteForm.temporaryPassword}
                  onChange={(e) => setStaffInviteForm({ ...staffInviteForm, temporaryPassword: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowStaffInviteModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedSubscription(null); }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground font-mono">{selectedSubscription.subscriptionNumber}</h2>
                <p className="text-xs text-muted-foreground">{selectedSubscription.customer?.legalName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    selectedSubscription.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : selectedSubscription.status === 'PAUSED'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {selectedSubscription.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSubscription(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Contract Lines</div>
                <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {selectedSubscription.items?.map((i: any) => (
                    <div key={i.id} className="p-2.5 flex justify-between items-center bg-muted/30">
                      <div>
                        <div className="font-semibold text-foreground">{i.descriptionSnapshot}</div>
                        <div className="text-[11px] text-muted-foreground">Qty: {i.quantity} × ${i.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="font-bold text-foreground">${i.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">Lifecycle Status History</div>
                <div className="space-y-2">
                  {selectedSubscription.events?.map((e: any) => (
                    <div key={e.id} className="rounded-lg bg-muted/40 p-2 border border-border">
                      <div className="flex justify-between font-semibold text-foreground">
                        <span>{e.fromStatus} → {e.toStatus}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        By {e.changedBy} {e.reason ? `• ${e.reason}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedSubscription(null)}
                className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: NEW DISCOUNT RULE */}
      {showNewDiscountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewDiscountModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Create Discount Rule</h2>
              <button
                type="button"
                onClick={() => setShowNewDiscountModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Admin-only configuration: fixed or percentage, seat minimums, validity dates, and usage limits.
            </p>

            <form onSubmit={handleCreateDiscountRule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Discount Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SEATS20"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs font-mono uppercase text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Volume Seat Discount"
                    value={discountForm.name}
                    onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Type</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder={discountForm.type === 'PERCENTAGE' ? 'e.g. 15 (%)' : 'e.g. 50 ($)'}
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Min Quantity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={discountForm.minQuantity}
                    onChange={(e) => setDiscountForm({ ...discountForm, minQuantity: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500"
                    value={discountForm.minAmount}
                    onChange={(e) => setDiscountForm({ ...discountForm, minAmount: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={discountForm.startsAt}
                    onChange={(e) => setDiscountForm({ ...discountForm, startsAt: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={discountForm.endsAt}
                    onChange={(e) => setDiscountForm({ ...discountForm, endsAt: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Usage Limit (Max Times)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited if empty"
                    value={discountForm.usageLimit}
                    onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Scope</label>
                  <select
                    value={discountForm.scopeType}
                    onChange={(e) => setDiscountForm({ ...discountForm, scopeType: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="ALL">Whole Subscription</option>
                    <option value="SPECIFIC_PRODUCTS">Specific Product Only</option>
                  </select>
                </div>
              </div>

              {discountForm.scopeType === 'SPECIFIC_PRODUCTS' && (
                <div>
                  <label className="block font-semibold text-foreground mb-1">Select Target Product</label>
                  <select
                    value={discountForm.productId}
                    onChange={(e) => setDiscountForm({ ...discountForm, productId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewDiscountModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Discount Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: CUSTOMER SIGN UP */}
      {showSignUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSignUpModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Customer Registration</h2>
              <button
                type="button"
                onClick={() => setShowSignUpModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enforces normalized email uniqueness and strict password policy (&gt;8 chars, uppercase, lowercase, special char).
            </p>

            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Company / Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="contact@apexdynamics.io"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 9 chars: Upper, lower & special char"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <div className="mt-1.5 space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${signUpForm.password.length >= 9 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <span>{signUpForm.password.length >= 9 ? '✓' : '○'}</span>
                    <span>More than 8 characters ({signUpForm.password.length} chars)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(signUpForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <span>{/[A-Z]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[a-z]/.test(signUpForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <span>{/[a-z]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(signUpForm.password) ? '✓' : '○'}</span>
                    <span>At least one special character</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowSignUpModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9B: NEW CUSTOMER ACCOUNT (ADMIN/STAFF) */}
      {showNewCustomerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewCustomerModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Create Customer Account</h2>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Register commercial account with billing profile, tax identifiers, and optional portal credentials.
            </p>

            <form onSubmit={handleCreateCustomerAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Legal Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Dynamics Ltd"
                  value={customerForm.legalName}
                  onChange={(e) => setCustomerForm({ ...customerForm, legalName: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Billing Email</label>
                <input
                  type="email"
                  required
                  placeholder="billing@apexdynamics.io"
                  value={customerForm.billingEmail}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingEmail: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Tax / VAT ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. US-TAX-7788"
                    value={customerForm.taxId}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Currency</label>
                  <select
                    value={customerForm.currency}
                    onChange={(e) => setCustomerForm({ ...customerForm, currency: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Billing Address</label>
                <input
                  type="text"
                  placeholder="123 Innovation Way, Suite 400"
                  value={customerForm.billingAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Portal Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave empty or min 9 chars (Upper, lower & special char)"
                  value={customerForm.password}
                  onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                {customerForm.password && (
                  <div className="mt-1.5 space-y-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${customerForm.password.length >= 9 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span>{customerForm.password.length >= 9 ? '✓' : '○'}</span>
                      <span>More than 8 characters ({customerForm.password.length} chars)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(customerForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span>{/[A-Z]/.test(customerForm.password) ? '✓' : '○'}</span>
                      <span>At least one uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(customerForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span>{/[a-z]/.test(customerForm.password) ? '✓' : '○'}</span>
                      <span>At least one lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(customerForm.password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(customerForm.password) ? '✓' : '○'}</span>
                      <span>At least one special character</span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  If set, enables self-service customer portal login with this email.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: FORGOT PASSWORD */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForgotModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground">Reset Password Link</h2>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              If a customer forgets their password, a secure single-use reset link arrives at their registered email.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Registered Account Email</label>
                <input
                  type="email"
                  required
                  placeholder="john@acme.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background p-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {resetResult && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-xs">
                  <div className="font-bold text-primary mb-1">Reset Token / Link Generated:</div>
                  <div className="font-mono text-[11px] text-foreground break-all select-all bg-card p-2 rounded border border-border">
                    {resetResult}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    In production, this is emailed with a secure single-use expiry token.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetResult(null);
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Generating...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
}
