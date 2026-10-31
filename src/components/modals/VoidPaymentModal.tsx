'use client';

import React, { useState } from 'react';
import Modal from '../Modal';

interface Payment {
  id: string;
  reference?: string | null;
  amount: number;
}

interface VoidPaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function VoidPaymentModal({
  payment,
  onClose,
  onSuccess,
  showToast,
}: VoidPaymentModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('A reason is mandatory for voiding a transaction.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/payments/${payment.id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Payment ${payment.reference || payment.id.slice(0, 8)} voided. Invoice balances restored.`, 'info');
        onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Failed to void payment', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(payment)}
      onClose={onClose}
      title="Void Payment Allocation"
      subtitle={`Payment ${payment.reference || payment.id.slice(0, 8)} ($${payment.amount.toFixed(2)})`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Voiding this transaction will mark the payment as VOIDED and restore the outstanding balances on all allocated invoices.
        </p>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Audit Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Chargeback, customer duplicate payment, manual entry error..."
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
          />
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
            className="rounded-lg bg-destructive px-4 py-2 font-semibold text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Voiding...' : 'Confirm Void'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
