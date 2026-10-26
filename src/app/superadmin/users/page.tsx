'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Role, UserStatus } from '@/types';
import { 
  
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  User as UserIcon, 
  Ban, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserWithStats extends User {
  orderCount?: number;
  totalSpent?: number;
}

export default function SuperadminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setNotification(null);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({ message: data.error || 'Failed to update role', type: 'error' });
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotification({ message: `Successfully updated user role to ${newRole}`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ message: 'Network error updating role', type: 'error' });
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: UserStatus) => {
    const nextStatus: UserStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setNotification(null);
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({ message: data.error || 'Failed to update status', type: 'error' });
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
      );
      setNotification({
        message: `User marked as ${nextStatus}`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ message: 'Network error updating user status', type: 'error' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          User & Role Governance
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Promote customer accounts to Admin, demote Admins to User, and manage account authorization statuses.
        </p>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Filter by Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none text-stone-800"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="USER">Customer (User)</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-3">Role Authority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Orders Placed</th>
                <th className="py-3 px-3">Lifetime Value</th>
                <th className="py-3 px-3">Registered Date</th>
                <th className="py-3 px-5 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">Loading user catalog...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">No users match your criteria.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              {u.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none transition-colors ${
                            u.role === 'SUPERADMIN'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : u.role === 'ADMIN'
                              ? 'bg-amber-50 text-amber-900 border-amber-200'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          } ${isCurrent ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:border-stone-400'}`}
                        >
                          <option value="USER">USER (Customer)</option>
                          <option value="ADMIN">ADMIN (Catalog & Orders)</option>
                          <option value="SUPERADMIN">SUPERADMIN (Master System)</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-stone-800">
                        {u.orderCount || 0} orders
                      </td>

                      <td className="py-3.5 px-3 font-serif font-bold text-stone-900">
                        ${(u.totalSpent || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3 text-stone-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              u.status === 'ACTIVE'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
