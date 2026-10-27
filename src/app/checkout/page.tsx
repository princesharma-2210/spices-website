'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  Tag
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discount, couponCode, shippingFee, tax, total, clearCart } = useCart();
  const { user } = useAuth();

  // Shipping details state
  const [fullName, setFullName] = useState(user?.name || 'Elena Rostova');
  const [email, setEmail] = useState(user?.email || 'user@anjalispices.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 017-8392');
  const [addressLine1, setAddressLine1] = useState('348 Culinary Crescent, Apt 4B');
  const [city, setCity] = useState('Seattle');
  const [state, setState] = useState('WA');
  const [postalCode, setPostalCode] = useState('98101');
  const [country] = useState('United States');

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Your basket is empty</h2>
        <p className="text-stone-500 text-xs mb-6">Please add some artisanal spices to your basket before checkout.</p>
        <Link href="/products" className="px-6 py-3 bg-spice-800 text-white rounded-xl text-xs font-semibold">
          Browse Spice Collection
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !addressLine1 || !city || !postalCode) {
      setError('Please fill in all required shipping fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            fullName,
            phone,
            addressLine1,
            city,
            state,
            postalCode,
            country,
          },
          email,
          paymentMethod,
          shippingMethod,
          couponCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        setIsSubmitting(false);
        return;
      }

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push(`/order-confirmation/${data.order.orderNumber}`);
    } catch {
      setError('Network error placing order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link href="/products" className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit Encrypted Secure Checkout</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Shipping, Delivery, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* 1. Contact & Shipping Address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-spice-800 text-white text-xs flex items-center justify-center font-bold">1</span>
              Delivery Address & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">Email for Shipment Tracking *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-700 block mb-1">Street Address *</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House number, apartment, street name"
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Postal Code *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shipping Speed */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-spice-800 text-white text-xs flex items-center justify-center font-bold">2</span>
              Shipping Method
            </h2>

            <div className="space-y-3">
              <label
                onClick={() => setShippingMethod('STANDARD')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'STANDARD'
                    ? 'border-spice-700 bg-spice-50/50 ring-1 ring-spice-700'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    shippingMethod === 'STANDARD' ? 'border-spice-700 bg-spice-700' : 'border-stone-400'
                  }`}>
                    {shippingMethod === 'STANDARD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-stone-900">Standard Harvest Eco-Ship (3-5 Days)</h4>
                    <p className="text-[11px] text-stone-500">Recycled fiber insulated packing with carbon-neutral courier</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {subtotal >= 50 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </label>

              <label
                onClick={() => setShippingMethod('EXPRESS')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'EXPRESS'
                    ? 'border-spice-700 bg-spice-50/50 ring-1 ring-spice-700'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    shippingMethod === 'EXPRESS' ? 'border-spice-700 bg-spice-700' : 'border-stone-400'
                  }`}>
                    {shippingMethod === 'EXPRESS' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      Priority Aroma-Lock Express (1-2 Days)
                      <span className="bg-saffron-100 text-saffron-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Fastest</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">Cold-chain insulated container with priority dispatch</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  {subtotal >= 50 ? '$6.99' : '$12.99'}
                </span>
              </label>
            </div>
          </div>

          {/* 3. Payment Method Simulation */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-spice-800 text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method Simulation
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD'
                    ? 'border-spice-700 bg-spice-50 ring-1 ring-spice-700 text-spice-900 font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-spice-800" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'border-spice-700 bg-spice-50 ring-1 ring-spice-700 text-spice-900 font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-spice-800" />
                <span className="text-xs">Instant UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'COD'
                    ? 'border-spice-700 bg-spice-50 ring-1 ring-spice-700 text-spice-900 font-bold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Truck className="w-5 h-5 text-spice-800" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="bg-stone-50 p-4 rounded-xl space-y-3 border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Simulated Card Payment</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instant Test Approval
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Security CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="bg-stone-50 p-4 rounded-xl text-center space-y-2 border border-stone-200">
                <p className="text-xs text-stone-600">Scan QR Code or pay with virtual payment address</p>
                <div className="w-28 h-28 bg-white border border-stone-300 rounded-xl mx-auto flex items-center justify-center p-2 shadow-inner">
                  <QrCode className="w-20 h-20 text-stone-800" />
                </div>
                <span className="text-[11px] text-stone-400 font-mono block">anjalispices@upi</span>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="bg-stone-50 p-4 rounded-xl text-xs text-stone-600 space-y-1 border border-stone-200">
                <p className="font-semibold text-stone-800">Pay cash upon delivery to your doorstep</p>
                <p className="text-[11px] text-stone-500">Please prepare exact cash for the delivery courier.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Order Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-md space-y-6 sticky top-28">
          <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
            Harvest Order Review ({cart.reduce((a, b) => a + b.quantity, 0)} items)
          </h3>

          {/* Items mini list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.weight}`} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">{item.name}</h4>
                  <span className="text-[11px] text-stone-500">{item.weight} &bull; Qty: {item.quantity}</span>
                </div>
                <span className="font-serif font-bold text-xs text-stone-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Applied coupon badge */}
          {couponCode && (
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Coupon Applied: {couponCode}
              </span>
              <span className="font-bold">-${discount.toFixed(2)}</span>
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="space-y-2 text-xs border-t border-stone-100 pt-4">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Shipping Fee</span>
              <span className="font-semibold text-stone-900">
                {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-stone-900 border-t border-stone-200 pt-3">
              <span>Total Due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-spice-800 hover:bg-spice-900 text-white rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Securing Order...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-saffron-300" />
                Place Order &bull; ${total.toFixed(2)}
              </>
            )}
          </button>

          <p className="text-[11px] text-stone-400 text-center leading-relaxed">
            By placing this order, you agree to Anjali Spices terms of harvest freshness and aroma retention guarantee.
          </p>
        </div>
      </form>
    </div>
  );
}
