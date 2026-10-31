'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface CustomerAccount {
  id: string;
  legalName: string;
  billingEmail: string;
  taxId?: string | null;
  billingAddress?: string | null;
  currency: string;
  timezone: string;
}

interface EditCustomerModalProps {
  customer: CustomerAccount | null;
  onClose: () => void;
  onSuccess: (updated: CustomerAccount) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditCustomerModal({
  customer,
  onClose,
  onSuccess,
  showToast,
}: EditCustomerModalProps) {
  const [formData, setFormData] = useState({
    legalName: '',
    billingEmail: '',
    taxId: '',
    billingAddress: '',
    currency: 'USD',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        legalName: customer.legalName,
        billingEmail: customer.billingEmail,
        taxId: customer.taxId || '',
        billingAddress: customer.billingAddress || '',
        currency: customer.currency || 'USD',
        timezone: customer.timezone || 'UTC',
      });
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Customer account "${formData.legalName}" updated successfully!`, 'success');
        onSuccess(data.data.customer);
        onClose();
      } else {
        showToast(data.error || 'Failed to update customer', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(customer)}
      onClose={onClose}
      title="Edit Customer Account"
      subtitle={`Update corporate profile and billing parameters for ${customer.legalName}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Legal Entity Name</label>
          <input
            type="text"
            required
            value={formData.legalName}
            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Billing Email</label>
            <input
              type="email"
              required
              value={formData.billingEmail}
              onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Tax / VAT ID</label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
              placeholder="e.g. US-EIN-992014"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Billing Address</label>
          <input
            type="text"
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            placeholder="Street address, City, Country"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Base Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Timezone</label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
              placeholder="UTC, America/New_York"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
