'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, User as UserIcon, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function DemoRoleBar() {
  const { user, switchDemoRole, loading } = useAuth();

  return (
    <div className="bg-gradient-to-r from-stone-900 via-spice-950 to-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-spice-800/50 shadow-inner z-50 relative">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Active Identity Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron-500"></span>
          </span>
          <span className="text-stone-400 font-medium">Active Role:</span>
          {user ? (
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
              user.role === 'SUPERADMIN' 
                ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40' 
                : user.role === 'ADMIN'
                ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40'
                : 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40'
            }`}>
              {user.role === 'SUPERADMIN' && <ShieldAlert className="w-3 h-3 text-purple-400" />}
              {user.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-amber-400" />}
              {user.role === 'USER' && <UserIcon className="w-3 h-3 text-emerald-400" />}
              {user.role} <span className="opacity-75">({user.name.split(' ')[0]})</span>
            </span>
          ) : (
            <span className="text-stone-400 italic">Guest (Not logged in)</span>
          )}
        </div>

        {/* Quick Demo Role Switcher Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-400 hidden sm:inline">Instant Role Switcher:</span>
          
          <button
            onClick={() => switchDemoRole('USER')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              user?.role === 'USER'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <UserIcon className="w-3 h-3" />
            Customer (User)
          </button>

          <button
            onClick={() => switchDemoRole('ADMIN')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              user?.role === 'ADMIN'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Admin
          </button>

          <button
            onClick={() => switchDemoRole('SUPERADMIN')}
            disabled={loading}
            className={`px-2.5 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              user?.role === 'SUPERADMIN'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400 font-bold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Superadmin
          </button>

          {/* Quick link to portals if Admin / Superadmin */}
          {user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
            <Link
              href="/admin"
              className="ml-2 text-saffron-300 hover:text-saffron-200 underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Open Admin Portal &rarr;
            </Link>
          )}

          {user && user.role === 'SUPERADMIN' && (
            <Link
              href="/superadmin"
              className="ml-1 text-purple-300 hover:text-purple-200 underline font-semibold flex items-center gap-1"
            >
              Superadmin Portal &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
