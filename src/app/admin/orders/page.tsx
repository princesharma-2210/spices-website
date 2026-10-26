'use client';

import React, { useState, useEffect } from 'react';

import { Order, OrderStatus } from '@/types';
import { 
  ShoppingBag, 
  Truck, 
  Search, 
  CheckCircle2, 
  X, 
  ExternalLink,
  MapPin,
  Clock,
  Filter
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Status / Tracking update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalStatus, setModalStatus] = useState<OrderStatus>('CONFIRMED');
  const [modalCarrier, setModalCarrier] = useState('');
  const [modalTracking, setModalTracking] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openUpdateModal = (ord: Order) => {
    setSelectedOrder(ord);
    setModalStatus(ord.orderStatus);
    setModalCarrier(ord.carrier || 'FedEx Priority Spices');
    setModalTracking(ord.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`);
    setModalNotes(ord.notes || '');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: modalStatus,
          carrier: modalCarrier,
          trackingNumber: modalTracking,
          notes: modalNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? data.order : o))
        );
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Dispatch fresh spice orders, assign courier tracking numbers, and view customer destinations.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none text-stone-800"
          >
            <option value="ALL">All Statuses ({orders.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing / Cold Milling</option>
            <option value="SHIPPED">Shipped / In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer & Delivery</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total Paid</th>
                <th className="py-3 px-3">Courier Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-stone-900 block">{ord.orderNumber}</span>
                      <span className="text-[10px] text-stone-400">{ord.paymentMethod}</span>
                    </td>

                    <td className="py-3 px-3 text-stone-500 font-medium">
                      {new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400">{ord.shippingAddress.city}, {ord.shippingAddress.state}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-800">{ord.items.length} items</span>
                        <span className="text-[10px] text-stone-400">
                          ({ord.items.map((i) => i.name.split(' ')[0]).slice(0, 2).join(', ')}...)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-serif font-bold text-stone-900">
                      ${ord.total.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                          ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                          ord.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                          ord.orderStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                          ord.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {ord.orderStatus}
                        </span>
                        {ord.trackingNumber && (
                          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                            {ord.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => openUpdateModal(ord)}
                        className="px-3 py-1.5 bg-spice-50 hover:bg-spice-100 text-spice-900 border border-spice-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Order Status & Courier Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Update Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-stone-500">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerEmail})
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Fulfillment Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as OrderStatus)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold uppercase focus:outline-none"
                >
                  <option value="CONFIRMED">CONFIRMED (Payment Verified)</option>
                  <option value="PROCESSING">PROCESSING (Cold Milling & Sealed)</option>
                  <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                  <option value="DELIVERED">DELIVERED (Completed)</option>
                  <option value="CANCELLED">CANCELLED (Refunded)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Courier Service</label>
                <input
                  type="text"
                  value={modalCarrier}
                  onChange={(e) => setModalCarrier(e.target.value)}
                  placeholder="e.g. FedEx Priority, DHL Express"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Waybill / Tracking Number</label>
                <input
                  type="text"
                  value={modalTracking}
                  onChange={(e) => setModalTracking(e.target.value)}
                  placeholder="e.g. FDX-99214088"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Internal Fulfillment Notes</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notes about custom batch grind, extra gift sampler..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-spice-800 hover:bg-spice-900 text-white rounded-xl font-semibold shadow-md"
                >
                  {updating ? 'Saving...' : 'Save & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
