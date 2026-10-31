'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  minAmount?: number | null;
  minQuantity?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  scopeType: string;
  active: boolean;
}

interface EditDiscountModalProps {
  discountRule: DiscountRule | null;
  onClose: () => void;
  onSuccess: (updated: DiscountRule) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditDiscountModal({
  discountRule,
  onClose,
  onSuccess,
  showToast,
}: EditDiscountModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    minAmount: '',
    usageLimit: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discountRule) {
      setFormData({
        name: discountRule.name,
        value: discountRule.value.toString(),
        minAmount: discountRule.minAmount !== null && discountRule.minAmount !== undefined ? discountRule.minAmount.toString() : '',
        usageLimit: discountRule.usageLimit !== null && discountRule.usageLimit !== undefined ? discountRule.usageLimit.toString() : '',
        active: discountRule.active,
      });
    }
  }, [discountRule]);

  if (!discountRule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/discount-rules/${discountRule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          value: Number(formData.value),
          minAmount: formData.minAmount ? Number(formData.minAmount) : null,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          active: formData.active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Discount rule "${discountRule.code}" updated successfully!`, 'success');
        onSuccess(data.data.discountRule);
        onClose();
      } else {
        showToast(data.error || 'Failed to update discount rule', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(discountRule)}
      onClose={onClose}
      title={`Edit Discount Rule (${discountRule.code})`}
      subtitle="Modify discount percentage/fixed value, eligibility, and usage cap."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Rule Name</label>
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
            <label className="block font-semibold text-foreground mb-1">
              Discount Value ({discountRule.type === 'PERCENTAGE' ? '%' : '$ USD'})
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Min Spend ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
              placeholder="Leave empty for none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Usage Limit (Max redemptions)</label>
          <input
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            placeholder="e.g. 100 (empty for unlimited)"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="editDiscountActive"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-input text-primary"
          />
          <label htmlFor="editDiscountActive" className="font-semibold text-foreground cursor-pointer">
            Coupon Active (available for checkout and quotes)
          </label>
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
