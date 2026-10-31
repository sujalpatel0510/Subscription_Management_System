'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface Subscription {
  id: string;
  subscriptionNumber: string;
  paymentTerms: string;
  nextBillingDate?: string | Date | null;
  expiryDate: string | Date;
  status: string;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenew: boolean;
  autoClose: boolean;
}

interface EditSubscriptionModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onSuccess: (updated: Subscription) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditSubscriptionModal({
  subscription,
  onClose,
  onSuccess,
  showToast,
}: EditSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    paymentTerms: 'Net 15',
    nextBillingDate: '',
    expiryDate: '',
    status: 'ACTIVE',
    allowPause: true,
    allowEarlyClose: true,
    allowRenew: true,
    autoClose: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        paymentTerms: subscription.paymentTerms || 'Net 15',
        nextBillingDate: subscription.nextBillingDate
          ? new Date(subscription.nextBillingDate).toISOString().split('T')[0]
          : '',
        expiryDate: subscription.expiryDate
          ? new Date(subscription.expiryDate).toISOString().split('T')[0]
          : '',
        status: subscription.status,
        allowPause: subscription.allowPause,
        allowEarlyClose: subscription.allowEarlyClose,
        allowRenew: subscription.allowRenew,
        autoClose: subscription.autoClose,
      });
    }
  }, [subscription]);

  if (!subscription) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentTerms: formData.paymentTerms,
          nextBillingDate: formData.nextBillingDate ? new Date(formData.nextBillingDate) : null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
          status: formData.status,
          allowPause: formData.allowPause,
          allowEarlyClose: formData.allowEarlyClose,
          allowRenew: formData.allowRenew,
          autoClose: formData.autoClose,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Subscription ${subscription.subscriptionNumber} updated successfully!`, 'success');
        onSuccess(data.data.subscription);
        onClose();
      } else {
        showToast(data.error || 'Failed to update subscription', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(subscription)}
      onClose={onClose}
      title={`Edit Subscription (${subscription.subscriptionNumber})`}
      subtitle="Modify billing cadence dates, payment terms, and lifecycle policies."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CONFIRMED">CONFIRMED</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Payment Terms</label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="Immediate">Immediate</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 60">Net 60</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Next Billing Date</label>
            <input
              type="date"
              value={formData.nextBillingDate}
              onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Contract Expiry Date</label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border p-3.5 space-y-2 bg-muted/30">
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block mb-1">
            Subscription Lifecycle Controls
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={formData.allowPause}
                onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                className="rounded border-input text-primary"
              />
              <span>Allow Pause</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={formData.allowEarlyClose}
                onChange={(e) => setFormData({ ...formData, allowEarlyClose: e.target.checked })}
                className="rounded border-input text-primary"
              />
              <span>Allow Early Close</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={formData.allowRenew}
                onChange={(e) => setFormData({ ...formData, allowRenew: e.target.checked })}
                className="rounded border-input text-primary"
              />
              <span>Allow Renew</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={formData.autoClose}
                onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                className="rounded border-input text-primary"
              />
              <span>Auto Close at Term</span>
            </label>
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
