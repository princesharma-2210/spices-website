'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { ShieldCheck, ShieldAlert, User as UserIcon, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to sign in');
      return;
    }

    router.push('/account');
  };

  const handleQuickDemo = async (role: Role) => {
    setSubmitting(true);
    const success = await switchDemoRole(role);
    setSubmitting(false);
    if (success) {
      if (role === 'SUPERADMIN') router.push('/superadmin');
      else if (role === 'ADMIN') router.push('/admin');
      else router.push('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-spice-800 text-saffron-300 font-serif font-black text-xl flex items-center justify-center mx-auto shadow-md">
          Z
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Welcome to Trade With Anjali
        </h1>
        <p className="text-xs text-stone-500">
          Sign in to your artisanal spices account
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spice-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-spice-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-spice-800 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* 1-Click Role Switcher Demo Cards */}
        <div className="pt-6 border-t border-stone-100 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
            Instant 1-Click Demo Login
          </span>

          <div className="space-y-2">
            <button
              onClick={() => handleQuickDemo('USER')}
              className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold leading-none">Customer (User)</div>
                  <div className="text-[10px] text-emerald-700 opacity-80">user@spices.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800">Login &rarr;</span>
            </button>

            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-900 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold leading-none">Admin</div>
                  <div className="text-[10px] text-amber-700 opacity-80">admin@spices.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-800">Login &rarr;</span>
            </button>

            <button
              onClick={() => handleQuickDemo('SUPERADMIN')}
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100/80 text-purple-900 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs font-bold leading-none">Superadmin</div>
                  <div className="text-[10px] text-purple-700 opacity-80">superadmin@spices.com</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-purple-800">Login &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
