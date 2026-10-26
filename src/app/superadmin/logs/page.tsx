'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import { Filter } from 'lucide-react';

export default function SuperadminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/audit-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (actionFilter === 'ALL') return true;
    return l.action.includes(actionFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            System Security & Audit Trail
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Immutable activity stream recording administrative modifications, permissions changes, and catalog updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Action:
          </span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs font-semibold bg-white border border-stone-200 rounded-xl px-3 py-2 focus:outline-none text-stone-800"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            <option value="ROLE">Role & Privilege Updates</option>
            <option value="PRODUCT">Product Modifications</option>
            <option value="ORDER">Order Actions</option>
            <option value="COUPON">Coupons</option>
            <option value="SETTINGS">Settings</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-3">Actor / Authority</th>
                <th className="py-3 px-3">Action Event</th>
                <th className="py-3 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-stone-400">Loading audit trail...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-stone-400">No logs found.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-5 text-stone-400 whitespace-nowrap text-[11px] font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          log.userRole === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                          log.userRole === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.userRole}
                        </span>
                        <span className="font-semibold text-stone-900 text-xs">{log.userName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-spice-900 bg-spice-50 px-2 py-0.5 rounded border border-spice-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-stone-600 text-xs leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
