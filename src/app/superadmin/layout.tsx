'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, switchDemoRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-stone-700 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Authorization Guard: Strict Superadmin only
  if (!user || user.role !== 'SUPERADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Superadmin Access Only
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              You are currently logged in as a <strong>{user ? user.role : 'Guest'}</strong>.
              This area contains master system configuration, role promotion/demotion, and audit logs.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
              Demo Elevate
            </span>
            <button
              onClick={() => switchDemoRole('SUPERADMIN')}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Elevate to Superadmin Role
            </button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Public Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/70 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-10 pt-16 lg:pt-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
