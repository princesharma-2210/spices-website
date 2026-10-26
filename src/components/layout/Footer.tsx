import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-spice-900">
      {/* Brand Value Pillars */}
      <div className="border-b border-stone-800 bg-stone-950/50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spice-900/80 text-saffron-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Direct Farm-Gate Harvest</h4>
                <p className="text-xs text-stone-400 mt-1">Sourced within days of harvest directly from generational heritage growers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spice-900/80 text-saffron-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Cold Stone Ground</h4>
                <p className="text-xs text-stone-400 mt-1">Slow granite milling under 35°C ensures natural essential volatile oils stay locked in.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spice-900/80 text-saffron-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Zero Fillers or Colorants</h4>
                <p className="text-xs text-stone-400 mt-1">100% pure botanical matter. Non-irradiated, pesticide-free, no added starch.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spice-900/80 text-saffron-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-white text-sm">Aroma-Lock Packaging</h4>
                <p className="text-xs text-stone-400 mt-1">Hermetically sealed multi-barrier UV foil and amber apothecary glass.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-spice-800 text-saffron-300 flex items-center justify-center font-serif font-bold text-lg">
              Z
            </div>
            <span className="font-serif font-bold text-white text-base">Zaffran & Clove</span>
          </div>
          <p className="text-stone-400 leading-relaxed">
            Curators of rare, potent, single-estate botanicals, sun-dried chillies, and heirloom ground masalas.
          </p>
          <div className="mt-4 text-stone-400">
            <p><strong>Concierge:</strong> concierge@zaffranandclove.com</p>
            <p className="mt-0.5"><strong>Phone:</strong> +1 (800) 555-SPICE</p>
          </div>
        </div>

        <div>
          <h5 className="font-serif font-bold text-white text-sm mb-3">Explore Spices</h5>
          <ul className="space-y-2 text-stone-400">
            <li><Link href="/products?category=Whole+Spices" className="hover:text-saffron-300 transition-colors">Whole Spices</Link></li>
            <li><Link href="/products?category=Ground+Spices" className="hover:text-saffron-300 transition-colors">Stone Ground Powders</Link></li>
            <li><Link href="/products?category=Blends+%26+Masalas" className="hover:text-saffron-300 transition-colors">Heritage Masalas</Link></li>
            <li><Link href="/products?category=Saffron+%26+Luxury+Botanicals" className="hover:text-saffron-300 transition-colors">Kashmiri Saffron & Vanilla</Link></li>
            <li><Link href="/products?sort=heat-desc" className="hover:text-saffron-300 transition-colors">Heat Index Explorer</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-serif font-bold text-white text-sm mb-3">Customer Service</h5>
          <ul className="space-y-2 text-stone-400">
            <li><Link href="/account" className="hover:text-saffron-300 transition-colors">Order Tracking</Link></li>
            <li><Link href="/account#addresses" className="hover:text-saffron-300 transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/products" className="hover:text-saffron-300 transition-colors">Aroma Retention Guarantee</Link></li>
            <li><Link href="/account#wishlist" className="hover:text-saffron-300 transition-colors">Saved Spices Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-serif font-bold text-white text-sm mb-3">Roles & Portals</h5>
          <p className="text-stone-400 mb-2 leading-relaxed">
            This platform includes 3 distinct permission roles:
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/account" className="text-emerald-400 hover:underline font-medium">
                &bull; Customer (User) Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-amber-400 hover:underline font-medium">
                &bull; Admin Management Portal
              </Link>
            </li>
            <li>
              <Link href="/superadmin" className="text-purple-400 hover:underline font-medium">
                &bull; Superadmin System Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800 text-center py-5 text-xs text-stone-500">
        &copy; {new Date().getFullYear()} Zaffran & Clove Artisanal Spices Co. Crafted for culinary purists.
      </div>
    </footer>
  );
}
