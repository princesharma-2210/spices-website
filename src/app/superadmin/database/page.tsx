'use client';

import React, { useState } from 'react';
import { RotateCcw, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SuperadminDatabasePage() {
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetData = async () => {
    if (!confirm('CAUTION: This will reset all spice inventory, customer orders, reviews, and restore pristine factory demo datasets. Do you wish to proceed?')) {
      return;
    }

    try {
      setResetting(true);
      setSuccessMsg('');
      setErrorMsg('');

      const res = await fetch('/api/admin/reset-data', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset store demo data');
        setResetting(false);
        return;
      }

      setSuccessMsg(data.message || 'Store demo data was successfully reset!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setErrorMsg('Network error occurred during database reset');
    } finally {
      setResetting(false);
    }
  };

  const handleExportJson = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);
      const products = await prodRes.json();
      const orders = await ordRes.json();

      const dump = {
        exportedAt: new Date().toISOString(),
        store: 'Zaffran & Clove Artisanal Spices',
        products: products.products,
        orders: orders.orders,
      };

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zaffran-spices-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Database Management & Factory Reset
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Export full JSON store snapshots or reset datasets to factory demo condition.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-spice-50 text-spice-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Export Store Snapshot (JSON)
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Generate and download a clean JSON payload of current spice catalog listings, customer purchase history, and fulfillment orders.
            </p>
          </div>

          <button
            onClick={handleExportJson}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON Backup
          </button>
        </div>

        {/* Factory Reset Demo Card */}
        <div className="bg-white rounded-3xl border border-red-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between bg-red-50/20">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-red-950">
              Restore Factory Demo Data
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Resets all spice stocks, mock customer orders, and reviews back to pristine baseline. Useful for demo presentations and testing fresh checkouts.
            </p>
          </div>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting Store Datasets...' : 'Reset to Default Demo State'}
          </button>
        </div>
      </div>
    </div>
  );
}
