'use client';

import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { Star, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews?all=true');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review tasting experiences, approve genuine feedback, and maintain culinary review authenticity.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Review Headline & Notes</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">No reviews submitted yet.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-bold text-stone-900">{r.userName}</div>
                      {r.isVerified && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">Verified Buyer</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-sm">
                      <h4 className="font-serif font-bold text-stone-900 text-xs">{r.title}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{r.comment}</p>
                      {r.heatPerception && (
                        <span className="text-[10px] text-stone-400 italic block mt-0.5">
                          Heat perception: {r.heatPerception}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-stone-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApprove(r.id, r.isApproved)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            r.isApproved
                              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={r.isApproved ? 'Hide Review' : 'Approve Review'}
                        >
                          {r.isApproved ? <XCircle className="w-4 h-4 text-stone-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
