'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface Plan {
  id: string;
  name: string;
  price: number;
  intervalUnit: string;
  minQuantity: number;
  allowPause: boolean;
  allowEarlyClose: boolean;
  allowRenew: boolean;
  autoClose: boolean;
  status: string;
}

interface EditPlanModalProps {
  plan: Plan | null;
  onClose: () => void;
  onSuccess: (updated: Plan) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditPlanModal({
  plan,
  onClose,
  onSuccess,
  showToast,
}: EditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    intervalUnit: 'MONTHLY',
    minQuantity: 1,
    allowPause: true,
    allowEarlyClose: true,
    allowRenew: true,
    autoClose: false,
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        intervalUnit: plan.intervalUnit,
        minQuantity: plan.minQuantity,
        allowPause: plan.allowPause,
        allowEarlyClose: plan.allowEarlyClose,
        allowRenew: plan.allowRenew,
        autoClose: plan.autoClose,
        status: plan.status,
      });
    }
  }, [plan]);

  if (!plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          intervalUnit: formData.intervalUnit,
          minQuantity: Number(formData.minQuantity),
          allowPause: formData.allowPause,
          allowEarlyClose: formData.allowEarlyClose,
          allowRenew: formData.allowRenew,
          autoClose: formData.autoClose,
          status: formData.status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Plan "${formData.name}" updated successfully!`, 'success');
        onSuccess(data.data.plan);
        onClose();
      } else {
        showToast(data.error || 'Failed to update plan', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(plan)}
      onClose={onClose}
      title="Edit Billing Plan"
      subtitle={`Configure cadence, pricing, and policy rules for ${plan.name}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Plan Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Interval Cadence</label>
            <select
              value={formData.intervalUnit}
              onChange={(e) => setFormData({ ...formData, intervalUnit: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Min Quantity (Seats)</label>
            <input
              type="number"
              min="1"
              value={formData.minQuantity}
              onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3.5 space-y-2 bg-muted/30">
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider block mb-1">
            Subscription Lifecycle Permissions
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
