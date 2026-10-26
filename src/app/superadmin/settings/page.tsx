'use client';

import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function SuperadminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setFeedback(null);

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ message: data.error || 'Failed to update store settings', type: 'error' });
        return;
      }

      setFeedback({ message: 'Store configuration saved successfully', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ message: 'Network error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-xs text-stone-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Global Store & Financial Settings
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure financial rules, shipping thresholds, tax calculation rates, and customer banners.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Brand Identity */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Brand Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Financial & Shipping Thresholds */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Pricing, Tax & Shipping Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Currency Symbol</label>
              <select
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold focus:outline-none"
              >
                <option value="$">$ (USD)</option>
                <option value="₹">₹ (INR)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Estimated Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Standard Shipping Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Express Priority Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.expressShippingFee}
                onChange={(e) => setSettings({ ...settings, expressShippingFee: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Customer Announcement Banner */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
            <span>Announcement Bar Banner</span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-normal">
              <input
                type="checkbox"
                checked={settings.showAnnouncement}
                onChange={(e) => setSettings({ ...settings, showAnnouncement: e.target.checked })}
                className="rounded text-purple-700"
              />
              <span className="font-semibold text-stone-700">Display on Storefront</span>
            </label>
          </h2>

          <div className="text-xs">
            <label className="font-bold text-stone-700 block mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Support Contacts */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Concierge Support Contacts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Concierge Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Global Store Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
