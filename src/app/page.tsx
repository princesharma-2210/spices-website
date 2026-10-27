import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDb } from '@/lib/db';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  Truck,
  Leaf,
  Globe2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getDb();
  const featuredProducts = db.products.filter(p => p.isFeatured).slice(0, 4);
  const bestsellers = db.products.filter(p => p.isBestseller).slice(0, 4);

  const categories = [
    {
      title: 'Spices & Pure Powders',
      count: db.products.filter(p => p.category === 'Spices & Pure Powders').length,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      href: '/products?category=Spices+%26+Pure+Powders',
      description: 'Stone-ground chilli, turmeric, coriander & Kura Karam powders',
    },
    {
      title: 'Authentic Masala Powders',
      count: db.products.filter(p => p.category === 'Authentic Masala Powders').length,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      href: '/products?category=Authentic+Masala+Powders',
      description: 'Temple-style sambar, rasam, garam masala & street-food blends',
    },
    {
      title: 'Regional Biryani & Curry Blends',
      count: db.products.filter(p => p.category === 'Regional Biryani & Curry Blends').length,
      image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
      href: '/products?category=Regional+Biryani+%26+Curry+Blends',
      description: 'Hyderabadi biryani, Andhra kodi kura & coastal seafood masalas',
    },
    {
      title: 'Traditional South Indian Powders',
      count: db.products.filter(p => p.category === 'Traditional South Indian Powders').length,
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
      href: '/products?category=Traditional+South+Indian+Powders',
      description: 'Puliogare, gutti vankaya & bisi bele bhath heritage mixes',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-spice-50/50 to-white pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-spice-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-saffron-100/90 border border-saffron-300/80 px-3 py-1.5 rounded-full text-xs font-semibold text-saffron-900 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                <span>2024 Fresh Harvest Direct from Estate Growers</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 leading-[1.1] tracking-tight">
                Pure, Unadulterated Spices. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-spice-800 via-paprika-700 to-saffron-700">
                  Straight from the Soil.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
                Experience the explosive potency of freshly harvested, single-origin botanicals.
                Slow stone-ground at low temperatures with zero fillers, radiation, or artificial aromas.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  Explore Collection
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products?sort=heat-desc"
                  className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 text-red-700"
                >
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 fill-red-500" />
                  Shop by Heat Level
                </Link>
              </div>

              {/* Quick Metrics */}
              <div className="pt-6 sm:pt-8 border-t border-spice-200/80 grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left">
                <div>
                  <div className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-spice-900">100%</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5">Single-Origin</div>
                </div>
                <div>
                  <div className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-spice-900">&lt; 35°C</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5">Cold Stone Milling</div>
                </div>
                <div>
                  <div className="font-serif font-black text-xl sm:text-2xl lg:text-3xl text-spice-900">0%</div>
                  <div className="text-[10px] sm:text-xs text-stone-500 font-medium mt-0.5">Fillers or Starch</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Mosaic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative bg-stone-100">
                  <Image
                    src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80"
                    alt="Spices in rustic bowls"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  
                  {/* Floating Highlight Card */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-saffron-700 uppercase tracking-widest block">
                          Featured Harvest
                        </span>
                        <h4 className="font-serif font-bold text-stone-900 text-sm">
                          Royal Kashmiri Mongra Saffron
                        </h4>
                        <span className="text-xs text-stone-500 font-medium">Grade A++ Stigmas &bull; Pampore</span>
                      </div>
                      <Link
                        href="/products/royal-kashmiri-mongra-saffron"
                        className="p-2.5 bg-spice-800 text-white rounded-xl shadow-md hover:bg-spice-900 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Decorative Spice Seal */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-saffron-500 text-white p-2 flex flex-col items-center justify-center text-center shadow-lg border-2 border-white rotate-12">
                  <ShieldCheck className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-black uppercase leading-tight tracking-tighter">Aroma Lock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-spice-700">Artisanal Collections</span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Shop by Botanical Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-spice-800 hover:text-spice-900 flex items-center gap-1 group"
          >
            View Full Spice Pantry
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200 card-shadow card-shadow-hover flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {cat.count} varietals
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif font-bold text-lg group-hover:text-saffron-300 transition-colors">
                    {cat.title}
                  </h3>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-500 leading-relaxed mb-3">
                  {cat.description}
                </p>
                <span className="text-xs font-semibold text-spice-700 group-hover:text-spice-900 inline-flex items-center gap-1">
                  Discover {cat.title} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Heat Index Explorer Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-spice-900 via-stone-900 to-paprika-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/40 px-3 py-1 rounded-full text-xs font-semibold text-red-200">
              <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Interactive Scoville & Heat Index</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Calibrated to Your Culinary Heat Threshold
            </h2>

            <p className="text-stone-300 text-sm leading-relaxed">
              From honeyed Kashmir saffron (0 SHU) and fragrant Tellicherry citrus black pepper (Medium) to fiery Guntur Sannam chillies (45,000 SHU) — find the precise heat profile for your recipes.
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/products?heat=0"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <span>🌿 Level 0: Aromatic (0 SHU)</span>
              </Link>
              <Link
                href="/products?heat=1"
                className="px-3.5 py-2 rounded-xl bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-colors"
              >
                <span>🔥 Level 1: Gentle Warmth</span>
              </Link>
              <Link
                href="/products?heat=2"
                className="px-3.5 py-2 rounded-xl bg-orange-900/40 hover:bg-orange-800/50 text-orange-200 text-xs font-semibold border border-orange-500/30 flex items-center gap-1.5 transition-colors"
              >
                <span>🌶️ Level 2: Medium Pepper</span>
              </Link>
              <Link
                href="/products?heat=4"
                className="px-3.5 py-2 rounded-xl bg-red-900/60 hover:bg-red-800/70 text-red-100 text-xs font-semibold border border-red-500/40 flex items-center gap-1.5 transition-colors"
              >
                <span>🌋 Level 4: Fiery Volcano</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Spices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-spice-700">Handpicked Selection</span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Curator’s Featured Spices
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-spice-800 hover:text-spice-900 flex items-center gap-1 group"
          >
            See All Featured
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-spice-700">Pantry Essentials</span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Customer Most-Loved Best Sellers
            </h2>
          </div>
          <Link
            href="/products?bestseller=true"
            className="text-xs font-bold text-spice-800 hover:text-spice-900 flex items-center gap-1 group"
          >
            View All Bestsellers
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Provenance & Ethos Banner */}
      <section className="bg-cream-200/60 py-10 sm:py-16 border-y border-spice-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-spice-700">
              The Anjali Spices Standard
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-2">
              Why Real Spices Smell, Look & Taste Different
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-3 leading-relaxed">
              Supermarket spices are typically over-processed with high friction mill heat, stored in clear plastic for years, and depleted of vital aromatic compounds. We do the opposite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200/80">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 sm:mb-4">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg mb-1.5 sm:mb-2">
                Generational Heritage Farmers
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                We contract directly with smallholder heritage estates in Kashmir, Kerala, Sri Lanka, and Spain, paying fair-trade premiums well above commodity market rates.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200/80">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 sm:mb-4">
                <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg mb-1.5 sm:mb-2">
                Traceable Batch Harvests
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                Every tin and pouch features the harvest season, altitude, curing technique, and origin estate stamped right on the front. No mysterious warehouse blends.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200/80">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-spice-50 text-spice-800 flex items-center justify-center mb-3 sm:mb-4">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg mb-1.5 sm:mb-2">
                UV & Oxygen Barrier Seal
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                Our heavy-gauge foil pouches and amber apothecary jars are flushed with food-grade nitrogen to halt oxidation, sealing that fresh-picked aroma until you crack the seal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter / Promo Club */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-spice-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-spice-800">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-saffron-300">
              Join the Spice Collector’s Guild
            </span>
            <h3 className="font-serif text-3xl font-bold">
              Receive 15% Off Your First Harvest
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Use promo code <span className="bg-spice-800 text-saffron-300 font-mono font-bold px-2 py-0.5 rounded border border-saffron-400/30">ANJALI15</span> at checkout. Subscribe to receive first access to rare saffron micro-lots and heirloom harvests.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-3 rounded-xl bg-stone-800 text-stone-100 text-xs border border-stone-700 focus:outline-none focus:ring-2 focus:ring-saffron-400 flex-1"
              />
              <button className="px-6 py-3 bg-saffron-500 hover:bg-saffron-600 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md">
                Claim 15% Off
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
