'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Order, SpiceProduct } from '@/types';
import { 
  Package, 
  Heart, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  ShoppingBag, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function AccountPage() {
  const { user, loading: authLoading, logout, switchDemoRole } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<SpiceProduct[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch orders and wishlist products
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchWishlistProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const all: SpiceProduct[] = data.products || [];
          setWishlistProducts(all.filter((p) => wishlist.includes(p.id)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
    fetchWishlistProducts();
  }, [user, wishlist]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-spice-200 border-t-spice-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-xs">Authenticating member session...</p>
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-spice-100 text-spice-800 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Sign In to Your Spice Account
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Access your harvest orders, track live spice shipments, manage wishlist botanicals, and saved delivery addresses.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold shadow-md"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-semibold"
          >
            Create Account
          </Link>
        </div>

        {/* Instant Demo Switcher */}
        <div className="pt-6 border-t border-stone-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
            Instant Demo Account Switcher
          </span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => switchDemoRole('USER')}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100"
            >
              Sign in as Customer
            </button>
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100"
            >
              Sign in as Admin
            </button>
            <button
              onClick={() => switchDemoRole('SUPERADMIN')}
              className="px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold hover:bg-purple-100"
            >
              Sign in as Superadmin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Hero Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-spice-800 text-saffron-300 font-serif font-black text-2xl flex items-center justify-center shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">{user.name}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Role Quick Links if Admin / Superadmin */}
        <div className="flex flex-wrap items-center gap-2">
          {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Admin Portal
            </Link>
          )}

          {user.role === 'SUPERADMIN' && (
            <Link
              href="/superadmin"
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              Superadmin Portal
            </Link>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-spice-800 text-spice-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" />
          My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-spice-800 text-spice-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-spice-800 text-spice-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Saved Addresses ({user.addresses?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-spice-800 text-spice-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile Settings
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="py-12 text-center text-stone-400 text-xs">Loading shipment history...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">No Orders Yet</h3>
              <p className="text-xs text-stone-500 mb-6">You have not placed any harvest orders yet.</p>
              <Link href="/products" className="px-5 py-2.5 bg-spice-800 text-white rounded-xl text-xs font-semibold">
                Explore Spices
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-xs text-stone-900 block">
                        Order #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        ord.orderStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {ord.orderStatus}
                      </span>

                      <Link
                        href={`/order-confirmation/${ord.orderNumber}`}
                        className="text-xs font-semibold text-spice-800 hover:text-spice-900 flex items-center gap-1"
                      >
                        Track Shipment
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Items row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                          <Image src={it.image} alt={it.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif font-bold text-stone-900 truncate">{it.name}</h4>
                          <span className="text-[11px] text-stone-500 block">{it.weight} &bull; Qty {it.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {ord.carrier ? `${ord.carrier} (${ord.trackingNumber || 'Active'})` : 'Standard Delivery'}
                    </span>
                    <span className="font-serif font-bold text-sm text-stone-900">
                      Total: ${ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">Your Wishlist is Empty</h3>
              <p className="text-xs text-stone-500 mb-6">Click the heart icon on any spice to save it for your next batch.</p>
              <Link href="/products" className="px-5 py-2.5 bg-spice-800 text-white rounded-xl text-xs font-semibold">
                Discover Fresh Spices
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate">{p.name}</h4>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{p.origin}</p>
                      <span className="font-serif font-bold text-xs text-stone-900 mt-1 block">
                        ${p.variants[0].price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(p, p.variants[0], 1)}
                    className="w-full py-2 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Basket
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.addresses?.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-2 relative">
                {addr.isDefault && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">
                    Default Shipping
                  </span>
                )}
                <h4 className="font-serif font-bold text-sm text-stone-900">{addr.fullName}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {addr.addressLine1} <br />
                  {addr.city}, {addr.state} {addr.postalCode} <br />
                  {addr.country}
                </p>
                <p className="text-[11px] text-stone-400 pt-1">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-xl space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Account Profile & Credentials
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-stone-500 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user.name}
                disabled
                className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-stone-700"
              />
            </div>
            <div>
              <label className="text-stone-500 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 text-stone-700"
              />
            </div>
            <div>
              <label className="text-stone-500 font-bold block mb-1">System Role Assigned</label>
              <input
                type="text"
                defaultValue={user.role}
                disabled
                className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 font-bold uppercase text-stone-800"
              />
            </div>
            <p className="text-[11px] text-stone-400 italic pt-2">
              Note: System roles can be updated by the Superadmin via the Superadmin User Control Portal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
