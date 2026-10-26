'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, SpiceProduct, Order } from '@/types';
import { 
  Users, 
  Settings, 
  FileText, 
  Database, 
  ShieldAlert, 
  DollarSign, 
  Package, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function SuperadminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<SpiceProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        const [usrRes, prdRes, ordRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        if (usrRes.ok) {
          const usrData = await usrRes.json();
          setUsers(usrData.users || []);
        }
        if (prdRes.ok) {
          const prdData = await prdRes.json();
          setProducts(prdData.products || []);
        }
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const superadminCount = users.filter((u) => u.role === 'SUPERADMIN').length;
  const customerCount = users.filter((u) => u.role === 'USER').length;

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-stone-500">
        Loading master control telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Master Superadmin Control Console
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            System & Role Governance
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage user authorization privileges, configure global store parameters, review system audit logs, and manage the database.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Total Accounts</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{users.length}</div>
            <span className="text-[10px] text-purple-700 font-semibold block mt-0.5">
              {customerCount} Customers, {adminCount} Admins
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Lifetime Volume</span>
            <div className="font-serif font-bold text-2xl text-stone-900">${totalVolume.toFixed(2)}</div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              {orders.length} Harvest Orders
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Admins & Staff</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{adminCount + superadminCount}</div>
            <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
              {superadminCount} Superadmin, {adminCount} Admins
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spice-50 text-spice-800 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Catalog Spices</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{products.length}</div>
            <span className="text-[10px] text-spice-700 font-semibold block mt-0.5">
              All Estates Active
            </span>
          </div>
        </div>
      </div>

      {/* 4 Feature Control Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hub 1: Users & Roles */}
        <Link
          href="/superadmin/users"
          className="group bg-white rounded-3xl border border-stone-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-purple-700 transition-colors">
              User & Role Governance
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Promote customers to Admin, demote Admins back to User, activate or suspend accounts, and view user lifetime purchases.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>Manage All User Roles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Hub 2: Store Settings */}
        <Link
          href="/superadmin/settings"
          className="group bg-white rounded-3xl border border-stone-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-stone-700 transition-colors">
              Global Store & Financial Settings
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Update store branding, currency symbol, tax percentage, free shipping threshold, support contact details, and announcement banner.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-800">
            <span>Configure Store Settings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Hub 3: Audit Logs */}
        <Link
          href="/superadmin/logs"
          className="group bg-white rounded-3xl border border-stone-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-amber-700 transition-colors">
              System Audit Trail
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Chronological security log of administrative activities, product adjustments, role changes, and inventory restocks.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Inspect Audit Logs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Hub 4: Database & Reset */}
        <Link
          href="/superadmin/database"
          className="group bg-white rounded-3xl border border-stone-200/80 p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-red-700 transition-colors">
              Database Export & Demo Reset
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Backup store datasets as JSON, or instantly restore the clean factory demo state with 1 click at any time.
            </p>
          </div>
          <div className="pt-6 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-red-700">
            <span>Database Utilities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
