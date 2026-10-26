'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpiceProduct, Order } from '@/types';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Tag, 
  CheckCircle,
  Truck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<SpiceProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [prodRes, ordRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
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

    fetchDashboardData();
  }, []);

  // Quick Restock API call
  const handleQuickRestock = async (productId: string, currentStock: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: currentStock + 50 }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: currentStock + 50 } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 50);
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500 text-xs">
        Loading admin telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Spice Merchant Operations
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time fulfillment metrics, harvest stock inventory, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Spice
          </Link>
          <Link
            href="/admin/coupons"
            className="px-4 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Tag className="w-4 h-4 text-spice-700" />
            Coupons
          </Link>
        </div>
      </div>

      {/* 4 Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Gross Sales</span>
            <div className="font-serif font-bold text-2xl text-stone-900">${totalRevenue.toFixed(2)}</div>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Live Store Revenue
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Total Orders</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{orders.length}</div>
            <span className="text-[10px] text-stone-500 mt-0.5">
              {orders.filter((o) => o.orderStatus === 'PROCESSING').length} pending dispatch
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spice-50 text-spice-800 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Active Spices</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{products.length}</div>
            <span className="text-[10px] text-stone-500 mt-0.5">Across 5 Categories</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-stone-500">Low Stock Alert</span>
            <div className="font-serif font-bold text-2xl text-stone-900">{lowStockProducts.length}</div>
            <span className="text-[10px] text-red-600 font-semibold mt-0.5">Needs harvest re-order</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Low Stock Alert Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif font-bold text-base text-stone-900">
              Recent Customer Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-spice-800 hover:text-spice-900 flex items-center gap-1"
            >
              Manage All Orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Items</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-stone-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400">{ord.customerEmail}</div>
                    </td>
                    <td className="py-3">{ord.items.length} spices</td>
                    <td className="py-3 font-serif font-bold text-stone-900">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        ord.orderStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="text-spice-700 hover:text-spice-900 font-bold text-[11px]"
                      >
                        Fulfill &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Low Stock Alert & 1-Click Quick Restock */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Low Stock Warnings
            </h3>
            <span className="text-xs text-stone-400 font-semibold">{lowStockProducts.length} items</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto pr-1">
            {lowStockProducts.slice(0, 6).map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <Image src={p.images[0]} alt="" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{p.name}</h4>
                    <span className="text-[10px] text-red-600 font-bold block">
                      Stock: {p.stock} units
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickRestock(p.id, p.stock)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                  title="Add 50 units immediately"
                >
                  +50 Restock
                </button>
              </div>
            ))}
          </div>

          <Link
            href="/admin/products"
            className="block text-center text-xs font-bold text-spice-800 hover:text-spice-900 pt-2 border-t border-stone-100"
          >
            Manage Catalog & Inventory &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
