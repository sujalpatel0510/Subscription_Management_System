'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface Product {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice?: number;
  notes?: string | null;
  status: string;
}

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: (updated: Product) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function EditProductModal({
  product,
  onClose,
  onSuccess,
  showToast,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Software',
    salesPrice: '',
    costPrice: '',
    notes: '',
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        type: product.type,
        salesPrice: product.salesPrice.toString(),
        costPrice: product.costPrice !== undefined ? product.costPrice.toString() : '',
        notes: product.notes || '',
        status: product.status,
      });
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          salesPrice: Number(formData.salesPrice),
          costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
          notes: formData.notes,
          status: formData.status,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Product "${formData.name}" updated successfully!`, 'success');
        onSuccess(data.data.product);
        onClose();
      } else {
        showToast(data.error || 'Failed to update product', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title="Edit Product"
      subtitle={`Update sales price, classification, and metadata for ${product.name}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Product Name</label>
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
            <label className="block font-semibold text-foreground mb-1">Product Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="Software">Software</option>
              <option value="Add-on">Add-on</option>
              <option value="Service">Service</option>
            </select>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Sales Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground mb-1">Cost Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
              placeholder="Internal only"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Internal Notes</label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-foreground focus:border-primary focus:outline-none"
            placeholder="Usage guidelines, license restrictions, etc."
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
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
