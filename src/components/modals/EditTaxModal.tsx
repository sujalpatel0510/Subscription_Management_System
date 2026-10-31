'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  calculationType: string;
  jurisdiction: string;
  active: boolean;
}

interface EditTaxModalProps {
  taxRule: TaxRate | null;
  onClose: () => void;
  onSuccess: (updated: TaxRate) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditTaxModal({
  taxRule,
  onClose,
  onSuccess,
  showToast,
}: EditTaxModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    calculationType: 'PERCENTAGE',
    jurisdiction: 'GLOBAL',
    active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taxRule) {
      setFormData({
        name: taxRule.name,
        rate: taxRule.rate.toString(),
        calculationType: taxRule.calculationType,
        jurisdiction: taxRule.jurisdiction,
        active: taxRule.active,
      });
    }
  }, [taxRule]);

  if (!taxRule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/tax-rules/${taxRule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          rate: Number(formData.rate),
          calculationType: formData.calculationType,
          jurisdiction: formData.jurisdiction,
          active: formData.active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Tax rule "${formData.name}" updated successfully!`, 'success');
        onSuccess(data.data.taxRule);
        onClose();
      } else {
        showToast(data.error || 'Failed to update tax rule', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(taxRule)}
      onClose={onClose}
      title="Edit Tax Rate Rule"
      subtitle={`Configure percentage and jurisdiction for ${taxRule.name}.`}
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
            <label className="block font-semibold text-foreground mb-1">Rate (%)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Jurisdiction</label>
            <input
              type="text"
              required
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
              placeholder="GLOBAL, EU, US-NY"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="editTaxActive"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded border-input text-primary"
          />
          <label htmlFor="editTaxActive" className="font-semibold text-foreground cursor-pointer">
            Rule Active (apply during invoice generation)
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
