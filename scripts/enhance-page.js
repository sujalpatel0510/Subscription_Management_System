const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add Sonner toast and Modal component imports
if (!content.includes("import { toast } from 'sonner';")) {
  content = content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { toast } from 'sonner';\nimport EditPlanModal from '@/components/modals/EditPlanModal';\nimport EditProductModal from '@/components/modals/EditProductModal';\nimport EditCustomerModal from '@/components/modals/EditCustomerModal';\nimport EditTaxModal from '@/components/modals/EditTaxModal';\nimport NewTaxModal from '@/components/modals/NewTaxModal';\nimport EditDiscountModal from '@/components/modals/EditDiscountModal';\nimport EditSubscriptionModal from '@/components/modals/EditSubscriptionModal';\nimport VoidPaymentModal from '@/components/modals/VoidPaymentModal';"
  );
}

// 2. Add Edit state hooks
const stateHookMarker = "const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);";
const additionalStates = `const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  // Modal Edit states
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingTaxRule, setEditingTaxRule] = useState<any>(null);
  const [showNewTaxModal, setShowNewTaxModal] = useState(false);
  const [editingDiscountRule, setEditingDiscountRule] = useState<any>(null);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [voidingPayment, setVoidingPayment] = useState<any>(null);`;

if (!content.includes("const [editingPlan, setEditingPlan]")) {
  content = content.replace(stateHookMarker, additionalStates);
}

// 3. Update showToast to trigger sonner toast
content = content.replace(
  `  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };`,
  `  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
    else toast.info(message);
    setNotification({ type: type === 'error' ? 'error' : 'success', message });
    setTimeout(() => setNotification(null), 4000);
  };`
);

// 4. Add Global Escape key listener to close ANY open modal
const escapeListenerCode = `
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
`;

if (!content.includes("// Global Escape key listener to dismiss any active modal instantly")) {
  content = content.replace("switchUser('admin@brightloop.io');\n  }, []);", "switchUser('admin@brightloop.io');\n  }, []);" + escapeListenerCode);
}

// 5. Add Delete & Edit Action handlers
const actionHandlers = `
  // Delete Plan
  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!window.confirm(\`Are you sure you want to delete or deactivate plan "\${planName}"?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/plans/\${planId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || \`Plan "\${planName}" processed.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete product "\${productName}" and all associated variants?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/products/\${productId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Product "\${productName}" deleted successfully.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete customer account "\${legalName}"?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/customers/\${customerId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Customer account "\${legalName}" removed.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete tax rule "\${taxName}"?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/tax-rules/\${taxId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Tax rule "\${taxName}" deleted.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete coupon rule "\${ruleCode}"?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/discount-rules/\${ruleId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Discount rule "\${ruleCode}" deleted.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete or close subscription \${subNumber}?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/subscriptions/\${subId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(data.data.message || \`Subscription \${subNumber} processed.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete draft invoice \${invNumber}?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/invoices/\${invId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Invoice \${invNumber} deleted successfully.\`, 'success');
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
    if (!window.confirm(\`Mark quotation \${quoteNumber} as CANCELLED?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/quotations/\${quoteId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(\`Quotation \${quoteNumber} cancelled.\`, 'info');
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
    if (!window.confirm(\`Are you sure you want to delete quotation \${quoteNumber}?\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/quotations/\${quoteId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Quotation \${quoteNumber} deleted.\`, 'success');
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
    if (!window.confirm(\`Are you sure you want to delete payment \${paymentRef}? Invoice balances will be reconciled.\`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(\`/api/v1/payments/\${paymentId}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(\`Payment \${paymentRef} record deleted.\`, 'success');
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
`;

if (!content.includes("// Delete Plan")) {
  content = content.replace("const handleCustomerSignUp =", actionHandlers + "\n  const handleCustomerSignUp =");
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully updated imports, state, escape key listener, and delete handlers in page.tsx');
