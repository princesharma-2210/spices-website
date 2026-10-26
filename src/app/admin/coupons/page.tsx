'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types';
import { Tag, Plus, Trash2, X, Check } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create coupon');
        setSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      setCode('');
      fetchCoupons();
    } catch {
      setErrorMsg('Network error creating coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${codeName}"?`)) return;

    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Promotional Coupons & Discounts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure seasonal harvest discount codes and minimum cart incentives.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Promo Code
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-stone-400">Loading promo codes...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-stone-200">
            <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-900 text-base mb-1">No Promo Codes Active</h3>
            <p className="text-xs text-stone-500 mb-6">Create promotional discount codes for your customers.</p>
          </div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-base text-spice-900 bg-spice-100/80 px-2.5 py-1 rounded-lg border border-spice-300/80 tracking-wider">
                    {c.code}
                  </span>
                  <div className="font-serif font-bold text-xl text-stone-900 mt-3">
                    {c.discountValue}{c.type === 'PERCENTAGE' ? '%' : '$'} OFF
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Min. cart total: ${c.minOrderValue.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.id, c.code)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Used: <strong>{c.usageCount} times</strong></span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                  c.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                }`}>
                  {c.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-spice-800" />
                Create New Promo Code
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUTUMN20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono uppercase font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Minimum Cart Subtotal ($)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-spice-800 hover:bg-spice-900 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {submitting ? 'Creating...' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
