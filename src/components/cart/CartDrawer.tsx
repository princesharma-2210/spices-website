'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    subtotal,
    shippingFee,
    tax,
    total,
    freeShippingProgress,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCoupon(inputCoupon.trim());
    setIsApplying(false);
    if (res.success) {
      setCouponSuccess(res.message);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
    }
  };

  const amountNeededForFreeShipping = Math.max(0, 499 - (subtotal - discount));

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-cream-50 shadow-2xl flex flex-col justify-between border-l border-spice-200 animate-fade-in">
          {/* Header */}
          <div className="p-3 sm:p-5 border-b border-spice-200/80 bg-white flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-spice-800 flex-shrink-0" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 truncate">Your Spice Basket</h2>
              <span className="text-[10px] sm:text-xs font-semibold bg-spice-100 text-spice-800 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Free Shipping Milestone */}
          <div className="bg-saffron-50 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-saffron-200/60">
            <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1 sm:gap-1.5 text-stone-800">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-saffron-600 flex-shrink-0" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="font-semibold text-emerald-800">You unlocked Free Express Shipping!</span>
                ) : (
                  <span>Add <strong className="text-saffron-800">₹{amountNeededForFreeShipping.toFixed(0)}</strong> more for Free Shipping</span>
                )}
              </span>
              <span className="text-stone-500 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-saffron-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-saffron-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 divide-y divide-spice-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-spice-100 flex items-center justify-center text-spice-600 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-stone-800 text-lg mb-1">Your basket is empty</h3>
                <p className="text-stone-500 text-xs max-w-xs mb-6">
                  Discover our freshly harvest single-origin spices, hand-ground masalas, and luxury saffron.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-5 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
                >
                  Explore Spice Collection
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.weight}`} className="flex gap-2 sm:gap-4 pt-2 sm:pt-3 first:pt-0">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={() => setIsCartDrawerOpen(false)}
                            className="font-serif font-semibold text-stone-900 text-xs sm:text-sm hover:text-spice-700 transition-colors line-clamp-2 sm:line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.productId, item.weight)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-0.5 sm:p-1 flex-shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] sm:text-xs text-stone-500 font-medium">Weight: {item.weight}</span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)}
                            className="p-0.5 sm:p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <span className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)}
                            className="p-0.5 sm:p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-3 sm:p-5 bg-white border-t border-spice-200 shadow-xl flex flex-col gap-2.5 sm:gap-3">
              {/* Promo code input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Promo Code: <strong className="tracking-wider">{couponCode}</strong> (-₹{discount.toFixed(0)})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-red-600 font-bold ml-2 p-1"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Discount code (e.g. ANJALI15)"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs uppercase focus:outline-none focus:ring-2 focus:ring-spice-700 bg-stone-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplying || !inputCoupon.trim()}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-700 mt-1">{couponSuccess}</p>}
              </div>

              {/* Subtotal, Tax, Shipping */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">₹{subtotal.toFixed(0)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-stone-800">
                    {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shippingFee.toFixed(0)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-stone-800">₹{tax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-3.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:gap-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="text-xs text-center text-stone-500 hover:text-stone-800 transition-colors"
              >
                or Continue Shopping &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
