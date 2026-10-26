'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/types';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Printer, 
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D97706', '#991B1B', '#15803D', '#FBBF24'],
    });

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-spice-200 border-t-spice-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Retrieving your harvest confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 text-xs mb-6">We could not locate this order reference.</p>
        <Link href="/" className="px-6 py-3 bg-spice-800 text-white rounded-xl text-xs font-semibold">
          Return to Home
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Harvest Order Placed', desc: 'Payment verified', done: true },
    { label: 'Cold-Milling & Sealing', desc: 'Nitrogen sealed', done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
    { label: 'Dispatched & In Transit', desc: order.carrier || 'Priority Courier', done: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus) },
    { label: 'Delivered to Doorstep', desc: order.estimatedDelivery || 'Estimated in 3 days', done: order.orderStatus === 'DELIVERED' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Hero Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Order Confirmed &bull; #{order.orderNumber}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Thank you for choosing artisanal purity!
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          We have received your harvest order. A confirmation email with tracking updates has been sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Live Order Timeline Tracking */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
          <h2 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-spice-800" />
            Live Shipment Status: <span className="text-spice-700 uppercase">{order.orderStatus}</span>
          </h2>
          {order.trackingNumber && (
            <span className="text-xs font-mono font-bold bg-stone-100 px-3 py-1 rounded-lg text-stone-700">
              Tracking: {order.trackingNumber}
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {steps.map((st, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                st.done
                  ? 'bg-spice-800 text-saffron-300 ring-4 ring-spice-100 shadow-md'
                  : 'bg-stone-100 text-stone-400 border border-stone-200'
              }`}>
                {st.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <h4 className={`text-xs font-bold ${st.done ? 'text-stone-900' : 'text-stone-400'}`}>
                {st.label}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Ordered Spices Table */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Package className="w-4 h-4 text-spice-800" />
            Items in This Shipment ({order.items.length})
          </h3>

          <div className="divide-y divide-stone-100">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-3 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image src={it.image} alt={it.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{it.name}</h4>
                  <span className="text-[11px] text-stone-500 font-medium">Size: {it.weight} &bull; Qty: {it.quantity}</span>
                </div>
                <span className="font-serif font-bold text-xs text-stone-900">
                  ${(it.price * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-stone-100 pt-3 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount ({order.couponCode})</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping ({order.shippingMethod})</span>
              <span className="font-semibold text-stone-900">
                {order.shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="font-semibold text-stone-900">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-stone-900 border-t border-stone-200 pt-2">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Shipping Address & Actions */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-spice-800" />
              Delivery Destination
            </h3>
            <div className="text-xs text-stone-600 space-y-1">
              <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2 text-stone-500 font-medium">Contact: {order.customerPhone}</p>
              <p className="text-stone-500 font-medium">Payment: {order.paymentMethod} (Verified)</p>
            </div>
          </div>

          <div className="bg-cream-100/80 rounded-3xl border border-cream-200 p-6 space-y-3">
            <div className="flex items-center gap-2 text-spice-900 font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-saffron-600" />
              Aroma Retention Guarantee
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              If your spices do not deliver an intensely fragrant, fresh harvest aroma upon opening, contact our concierge for a complimentary replacement jar.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <Link
              href="/account"
              className="w-full py-3 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              View Order in Account Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save Harvest Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
