'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings, 
  FileText, 
  Database,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isSuperadmin = user?.role === 'SUPERADMIN';

  const adminNav = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Spices Catalog', href: '/admin/products', icon: Package },
    { label: 'Orders & Tracking', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Promo Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Reviews Moderation', href: '/admin/reviews', icon: MessageSquare },
  ];

  const superadminNav = [
    { label: 'User & Role Control', href: '/superadmin/users', icon: Users },
    { label: 'Store Settings', href: '/superadmin/settings', icon: Settings },
    { label: 'System Audit Logs', href: '/superadmin/logs', icon: FileText },
    { label: 'Database & Reset', href: '/superadmin/database', icon: Database },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 border-r border-stone-800 min-h-screen">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-spice-700 to-saffron-500 flex items-center justify-center font-serif font-bold text-white shadow-md">
            Z
          </div>
          <div>
            <h2 className="font-serif font-bold text-white text-sm">Zaffran & Clove</h2>
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block -mt-0.5">
              Portal Console
            </span>
          </div>
        </div>

        {/* Current Role Banner */}
        <div className={`p-3 rounded-xl border ${
          isSuperadmin
            ? 'bg-purple-950/40 border-purple-800/50 text-purple-200'
            : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold text-xs">
            {isSuperadmin ? <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isSuperadmin ? 'Superadmin Privileges' : 'Admin Privileges'}</span>
          </div>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">
            Logged in as {user?.name || 'Administrator'}
          </p>
        </div>

        {/* Admin Section */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 block mb-1">
            Store Management
          </span>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-spice-800 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-saffron-300' : 'text-stone-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Superadmin Section (only shown for Superadmin) */}
        {isSuperadmin && (
          <div className="space-y-1 pt-4 border-t border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-3 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Superadmin Only
            </span>
            {superadminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-purple-300' : 'text-purple-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Back Link */}
      <div className="p-4 border-t border-stone-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-stone-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Storefront
        </Link>
      </div>
    </aside>
  );
}
