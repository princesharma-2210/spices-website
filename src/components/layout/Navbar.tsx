'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Sparkles,
  Flame,
  ChevronDown
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-spice-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-spice-900 text-stone-200 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
          <span>Authentic Indian Heritage Spices: Enjoy 15% off with code <strong>ANJALI15</strong> | Free Shipping over ₹499</span>
        </span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-spice-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-spice-900 to-paprika-700 flex items-center justify-center text-saffron-300 shadow-md">
              <span className="font-serif font-black text-xl">A</span>
            </div>
            <div>
              <span className="font-serif font-bold text-xl sm:text-2xl tracking-tight text-stone-900 block leading-tight">
                Anjali Spices
              </span>
              <span className="text-[10px] uppercase tracking-widest text-spice-700 font-semibold block -mt-1">
                Authentic Indian Masalas & Pure Powders
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-700">
            <Link href="/products" className="hover:text-spice-800 transition-colors">
              All Spices
            </Link>
            <Link href="/products?category=Spices+%26+Pure+Powders" className="hover:text-spice-800 transition-colors">
              Pure Spices
            </Link>
            <Link href="/products?category=Authentic+Masala+Powders" className="hover:text-spice-800 transition-colors">
              Authentic Masalas
            </Link>
            <Link href="/products?category=Regional+Biryani+%26+Curry+Blends" className="hover:text-spice-800 transition-colors">
              Biryani Blends
            </Link>
            <Link href="/products?category=Traditional+South+Indian+Powders" className="hover:text-spice-800 transition-colors">
              Traditional Powders
            </Link>
            <Link href="/products?sort=heat-desc" className="hover:text-spice-800 transition-colors flex items-center gap-1 text-red-700 font-semibold">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              Heat Index
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saffron, pepper, cumin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-100/80 hover:bg-stone-100 focus:bg-white text-xs border border-transparent focus:border-spice-300 rounded-full focus:outline-none focus:ring-2 focus:ring-spice-600/20 transition-all text-stone-800"
            />
          </form>

          {/* Actions: Wishlist, Cart, Account */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist Link */}
            <Link
              href="/account#wishlist"
              className="p-2 text-stone-700 hover:text-spice-800 relative rounded-full hover:bg-stone-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2 text-stone-700 hover:text-spice-800 relative rounded-full hover:bg-stone-100 transition-colors"
              title="Spice Basket"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-spice-800 text-saffron-300 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account / Role dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-spice-800 text-saffron-200 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-stone-900 leading-none">
                        {user.name.split(' ')[0]}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'SUPERADMIN' ? 'text-purple-600' :
                        user.role === 'ADMIN' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-fade-in"
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-900">{user.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          Role: {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-spice-50 hover:text-spice-900"
                        >
                          <UserIcon className="w-4 h-4 text-stone-400" />
                          My Orders & Account
                        </Link>

                        {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-amber-900 hover:bg-amber-50 font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Admin Dashboard
                          </Link>
                        )}

                        {user.role === 'SUPERADMIN' && (
                          <Link
                            href="/superadmin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-purple-900 hover:bg-purple-50 font-semibold"
                          >
                            <ShieldAlert className="w-4 h-4 text-purple-600" />
                            Superadmin Portal
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-stone-100 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-spice-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search whole spices, powders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-100 text-xs rounded-xl focus:outline-none"
              />
            </form>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-800 py-1"
            >
              All Spices Collection
            </Link>
            <Link
              href="/products?category=Spices+%26+Pure+Powders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-800 py-1"
            >
              Pure Spices (Chilli, Turmeric, Dhania)
            </Link>
            <Link
              href="/products?category=Authentic+Masala+Powders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-800 py-1"
            >
              Authentic Masalas (Sambar, Rasam, Garam Masala)
            </Link>
            <Link
              href="/products?category=Regional+Biryani+%26+Curry+Blends"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-800 py-1"
            >
              Biryani & Curry Masalas
            </Link>
            <Link
              href="/products?category=Traditional+South+Indian+Powders"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-800 py-1"
            >
              Traditional Powders (Puliogare, Vankaya)
            </Link>
            <Link
              href="/products?sort=heat-desc"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-red-700 py-1 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" />
              Heat Explorer
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
