'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SpiceProduct, SpiceCategory, ProductVariant } from '@/types';
import { HeatIndicator } from '@/components/products/HeatIndicator';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Sparkles,
  Flame,
  Package
} from 'lucide-react';

const CATEGORIES: SpiceCategory[] = [
  'Whole Spices',
  'Ground Spices',
  'Blends & Masalas',
  'Saffron & Luxury Botanicals',
  'Herbs & Seasonings',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<SpiceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SpiceProduct | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<SpiceCategory>('Whole Spices');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formOriginCountry, setFormOriginCountry] = useState('');
  const [formHeatLevel, setFormHeatLevel] = useState<number>(0);
  const [formAromaNotes, setFormAromaNotes] = useState('');
  const [formCulinaryUses, setFormCulinaryUses] = useState('');
  const [formHarvestYear, setFormHarvestYear] = useState('2024 Fresh Harvest');
  const [formOrganic, setFormOrganic] = useState(true);
  const [formSingleOrigin, setFormSingleOrigin] = useState(true);
  const [formStock, setFormStock] = useState(60);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([
    { weight: '100g', price: 12.00, stock: 60 },
    { weight: '250g', price: 25.00, stock: 40 },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Whole Spices');
    setFormTagline('');
    setFormDescription('');
    setFormOrigin('Wayanad, Kerala');
    setFormOriginCountry('India');
    setFormHeatLevel(1);
    setFormAromaNotes('Woody, Citrus, Peppery');
    setFormCulinaryUses('Curries, Marinades, Roasts');
    setFormHarvestYear('2024 Fresh Crop');
    setFormOrganic(true);
    setFormSingleOrigin(true);
    setFormStock(75);
    setFormImageUrl('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80');
    setFormVariants([
      { weight: '100g', price: 12.00, stock: 75 },
      { weight: '250g', price: 26.00, stock: 50 },
    ]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: SpiceProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormTagline(p.tagline);
    setFormDescription(p.description);
    setFormOrigin(p.origin);
    setFormOriginCountry(p.originCountry);
    setFormHeatLevel(p.heatLevel);
    setFormAromaNotes(p.aromaNotes.join(', '));
    setFormCulinaryUses(p.culinaryUses.join(', '));
    setFormHarvestYear(p.harvestYear);
    setFormOrganic(p.organic);
    setFormSingleOrigin(p.singleOrigin);
    setFormStock(p.stock);
    setFormImageUrl(p.images[0] || '');
    setFormVariants(p.variants);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the spices catalog?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Product name is required');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        name: formName.trim(),
        category: formCategory,
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        origin: formOrigin.trim(),
        originCountry: formOriginCountry.trim(),
        heatLevel: Number(formHeatLevel),
        aromaNotes: formAromaNotes.split(',').map((s) => s.trim()).filter(Boolean),
        culinaryUses: formCulinaryUses.split(',').map((s) => s.trim()).filter(Boolean),
        harvestYear: formHarvestYear.trim(),
        organic: formOrganic,
        singleOrigin: formSingleOrigin,
        stock: Number(formStock),
        images: [formImageUrl || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'],
        variants: formVariants,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save product');
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch {
      setErrorMsg('Network error saving product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Spices Catalog Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your single-origin spice catalog, adjust stock levels, and set heat indexes.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Spice
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search spice by name or origin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-spice-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none text-stone-800"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spices Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-5">Spice</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Origin</th>
                <th className="py-3 px-3">Heat</th>
                <th className="py-3 px-3">Variants</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    Loading spice inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    No spices match your search query.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <Image src={p.images[0]} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-stone-900 text-xs">{p.name}</div>
                          <span className="text-[10px] text-stone-400 line-clamp-1">{p.tagline}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-spice-50 text-spice-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-spice-200/60">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-stone-600 font-medium">
                      {p.origin}
                    </td>

                    <td className="py-3 px-3">
                      <HeatIndicator level={p.heatLevel} size="sm" showLabel={false} />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.variants.map((v) => (
                          <span key={v.weight} className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-700 font-mono">
                            {v.weight} (${v.price})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        p.stock <= 15 ? 'bg-red-100 text-red-800' :
                        p.stock <= 50 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-50 text-emerald-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Spice"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Spice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-spice-800" />
                {editingProduct ? `Edit Spice: ${editingProduct.name}` : 'Add New Artisanal Spice'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Spice Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Royal Tellicherry Bold"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SpiceCategory)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="Sun-Ripened Jumbo Berries with Citrus Aroma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Description & Harvest Story</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Origin Estate / Region</label>
                  <input
                    type="text"
                    value={formOrigin}
                    onChange={(e) => setFormOrigin(e.target.value)}
                    placeholder="Wayanad, Malabar Coast"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Origin Country</label>
                  <input
                    type="text"
                    value={formOriginCountry}
                    onChange={(e) => setFormOriginCountry(e.target.value)}
                    placeholder="India, Sri Lanka, Spain..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-500" /> Heat Level (0 to 4)
                  </label>
                  <select
                    value={formHeatLevel}
                    onChange={(e) => setFormHeatLevel(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  >
                    <option value={0}>0 - None (Aromatic / Sweet)</option>
                    <option value={1}>1 - Mild Warmth</option>
                    <option value={2}>2 - Medium Pepper Heat</option>
                    <option value={3}>3 - Spicy & Hot</option>
                    <option value={4}>4 - Fiery Volcano</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Total Stock (Units)</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Aroma Notes (comma separated)</label>
                  <input
                    type="text"
                    value={formAromaNotes}
                    onChange={(e) => setFormAromaNotes(e.target.value)}
                    placeholder="Earthy, Woody, Citrus, Honey"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Culinary Uses (comma separated)</label>
                  <input
                    type="text"
                    value={formCulinaryUses}
                    onChange={(e) => setFormCulinaryUses(e.target.value)}
                    placeholder="Biryani, Chai, Steak au Poivre"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Section */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="font-bold text-stone-700 block">Weight Options & Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  {formVariants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center bg-stone-50 p-2 rounded-xl border border-stone-200">
                      <input
                        type="text"
                        value={v.weight}
                        onChange={(e) => {
                          const next = [...formVariants];
                          next[i].weight = e.target.value;
                          setFormVariants(next);
                        }}
                        className="w-20 bg-white border border-stone-200 rounded p-1 text-center font-bold"
                      />
                      <span className="text-stone-400">$</span>
                      <input
                        type="number"
                        step="0.5"
                        value={v.price}
                        onChange={(e) => {
                          const next = [...formVariants];
                          next[i].price = Number(e.target.value);
                          setFormVariants(next);
                        }}
                        className="w-20 bg-white border border-stone-200 rounded p-1 text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={formOrganic}
                    onChange={(e) => setFormOrganic(e.target.checked)}
                    className="rounded text-spice-800"
                  />
                  <span>100% Organic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={formSingleOrigin}
                    onChange={(e) => setFormSingleOrigin(e.target.checked)}
                    className="rounded text-spice-800"
                  />
                  <span>Single-Origin Estate</span>
                </label>
              </div>

              {/* Modal CTAs */}
              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-spice-800 hover:bg-spice-900 text-white font-semibold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Spice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
