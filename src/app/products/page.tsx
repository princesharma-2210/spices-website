'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SpiceProduct, SpiceCategory } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { 
  Filter, 
  Search, 
  Flame, 
  RotateCcw, 
  SlidersHorizontal,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const CATEGORIES: ('All' | SpiceCategory)[] = [
  'All',
  'Whole Spices',
  'Ground Spices',
  'Blends & Masalas',
  'Saffron & Luxury Botanicals',
  'Herbs & Seasonings',
];

const HEAT_LEVELS = [
  { value: 'all', label: 'All Heat Levels' },
  { value: '0', label: '🌿 0 - Aromatic / Sweet' },
  { value: '1', label: '🔥 1 - Mild Warmth' },
  { value: '2', label: '🌶️ 2 - Medium Bite' },
  { value: '3', label: '🌋 3 - Hot' },
  { value: '4', label: '💥 4 - Fiery' },
];

function ProductsCatalogContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<SpiceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [selectedHeat, setSelectedHeat] = useState<string>(
    searchParams.get('heat') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [organicOnly, setOrganicOnly] = useState<boolean>(
    searchParams.get('organic') === 'true'
  );
  const [singleOriginOnly, setSingleOriginOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get('sort') || 'featured'
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const heat = searchParams.get('heat');
    if (heat) setSelectedHeat(heat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
    const s = searchParams.get('sort');
    if (s) setSortBy(s);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Heat Level
    if (selectedHeat !== 'all') {
      const heatNum = parseInt(selectedHeat, 10);
      result = result.filter((p) => p.heatLevel === heatNum);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.aromaNotes.some((n) => n.toLowerCase().includes(q))
      );
    }

    // Organic filter
    if (organicOnly) {
      result = result.filter((p) => p.organic);
    }

    // Single Origin filter
    if (singleOriginOnly) {
      result = result.filter((p) => p.singleOrigin);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.variants[0].price - b.variants[0].price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.variants[0].price - a.variants[0].price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'heat-asc':
        result.sort((a, b) => a.heatLevel - b.heatLevel);
        break;
      case 'heat-desc':
        result.sort((a, b) => b.heatLevel - a.heatLevel);
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedHeat,
    searchQuery,
    organicOnly,
    singleOriginOnly,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedHeat('all');
    setSearchQuery('');
    setOrganicOnly(false);
    setSingleOriginOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedHeat !== 'all' ||
    searchQuery !== '' ||
    organicOnly ||
    singleOriginOnly ||
    sortBy !== 'featured';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header / Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-2 font-medium">
          <a href="/" className="hover:text-stone-800">Home</a>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-semibold">Artisanal Spice Collection</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Single-Origin Spices & Blends
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Explore freshly harvested botanicals, whole peppercorns, fragrant green cardamoms, and heirloom masalas.
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex-1 py-2.5 px-4 bg-white border border-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-spice-700" />
              Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-saffron-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 items-start">
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <div
          className={`md:col-span-1 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-spice-800" />
              Filter Catalog
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-spice-700 hover:text-spice-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Search Spices
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name, notes, origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spice-700"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Categories
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-spice-800 text-white font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] ${
                    selectedCategory.toLowerCase() === cat.toLowerCase() ? 'text-saffron-300' : 'text-stone-400'
                  }`}>
                    {cat === 'All' ? products.length : products.filter((p) => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Heat Level Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              Heat Index
            </label>
            <div className="space-y-1">
              {HEAT_LEVELS.map((heat) => (
                <button
                  key={heat.value}
                  onClick={() => setSelectedHeat(heat.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
                    selectedHeat === heat.value
                      ? 'bg-spice-100 text-spice-900 border border-spice-300 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {heat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary & Provenance Toggles */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Badges & Ethics
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="rounded text-spice-700 focus:ring-spice-700"
              />
              <span>100% Certified Organic</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
              <input
                type="checkbox"
                checked={singleOriginOnly}
                onChange={(e) => setSingleOriginOnly(e.target.checked)}
                className="rounded text-spice-700 focus:ring-spice-700"
              />
              <span>Single-Origin Estate</span>
            </label>
          </div>
        </div>

        {/* Product Grid & Sorting Toolbar */}
        <div className="md:col-span-3 lg:col-span-4 space-y-6">
          {/* Top Results & Sort Toolbar */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-stone-600 font-medium">
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> artisanal spices
              {selectedCategory !== 'All' && <span> in <em className="text-spice-800">{selectedCategory}</em></span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-spice-700 text-stone-800"
              >
                <option value="featured">Featured & Curated</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="heat-desc">Heat: Highest Scoville First</option>
                <option value="heat-asc">Heat: Mild & Aromatic First</option>
                <option value="newest">Fresh Harvest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-100" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-8">
              <div className="w-14 h-14 rounded-full bg-spice-100 text-spice-700 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg mb-1">
                No Spices Found
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Try loosening your filters or resetting your search query to explore our other harvests.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-spice-800 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500">Loading spice catalog...</p>
      </div>
    }>
      <ProductsCatalogContent />
    </Suspense>
  );
}
