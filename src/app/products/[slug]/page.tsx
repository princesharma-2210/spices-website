'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SpiceProduct, ProductVariant, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { HeatIndicator } from '@/components/products/HeatIndicator';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Minus, 
  Plus, 
  Flame, 
  Sparkles, 
  ChefHat, 
  ChevronRight,
  MessageSquarePlus,
  Send
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  // auth

  const [product, setProduct] = useState<SpiceProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHeat, setReviewHeat] = useState('As expected');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch product and its reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/reviews?productId=${data.product.id}`);
          if (revRes.ok) {
            const revData = await revRes.json();
            setReviews(revData.reviews || []);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-spice-200 border-t-spice-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Unlocking fresh harvest details...</p>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">Spice Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">The spice you are searching for might have sold out or been re-batched.</p>
        <Link href="/products" className="px-6 py-3 bg-spice-800 text-white rounded-xl text-xs font-semibold">
          Return to Spice Pantry
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    try {
      setIsSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
          heatPerception: reviewHeat,
        }),
      });

      const data = await res.json();
      if (res.ok && data.review) {
        setReviews([data.review, ...reviews]);
        setReviewSuccess('Thank you! Your culinary review has been published.');
        setReviewTitle('');
        setReviewComment('');
        setTimeout(() => {
          setShowReviewForm(false);
          setReviewSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
        <Link href="/" className="hover:text-stone-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href="/products" className="hover:text-stone-900">Spices</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-stone-900">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Imagery Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-md">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.isBestseller && (
                <span className="bg-stone-900 text-saffron-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Bestseller
                </span>
              )}
              {product.organic && (
                <span className="bg-emerald-800 text-emerald-100 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  100% Organic
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all hover:scale-110"
              title="Add to Wishlist"
            >
              <Heart
                className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-600'}`}
              />
            </button>
          </div>

          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-spice-800 shadow-md scale-105' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Options & Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {/* Category & Heat */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold tracking-widest text-spice-700 uppercase">
                {product.category}
              </span>
              <HeatIndicator level={product.heatLevel} size="md" showLabel={true} />
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-stone-600 italic mt-1.5">
              &ldquo;{product.tagline}&rdquo;
            </p>

            {/* Rating Bar */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-stone-800">{product.rating.toFixed(2)}</span>
              <span className="text-xs text-stone-500">({product.reviewCount} verified reviews)</span>
            </div>
          </div>

          {/* Price & Weight Selection */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-stone-900">
                ₹{(selectedVariant.price * quantity).toFixed(0)}
              </span>
              {selectedVariant.originalPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{(selectedVariant.originalPrice * quantity).toFixed(0)}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Fresh Harvest Batch
              </span>
            </div>

            {/* Variant Pills */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Select Packaging Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.weight}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedVariant.weight === v.weight
                        ? 'bg-spice-900 text-white border-spice-900 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{v.weight}</div>
                    <div className="text-[11px] opacity-80">₹{v.price.toFixed(0)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Add to Basket Button */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-stone-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-stone-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  product.stock === 0
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-spice-800 hover:bg-spice-900 text-white hover:shadow-lg'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Basket!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add {quantity > 1 ? `${quantity} Packs` : ''} to Basket &bull; ₹{(selectedVariant.price * quantity).toFixed(0)}
                  </>
                )}
              </button>
            </div>

            {/* Inventory Status */}
            <div className="pt-2 text-xs flex items-center justify-between text-stone-500 border-t border-stone-100">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {product.stock > 10 ? `In Stock (${product.stock} units available)` : `Low Stock: Only ${product.stock} remaining`}
              </span>
              <span>Aroma-Lock Glass Apothecary Jar</span>
            </div>
          </div>

          {/* Quick Provenance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-cream-100/80 p-3 rounded-xl border border-cream-200">
              <span className="text-[10px] font-bold text-spice-700 uppercase flex items-center gap-1">
                <Globe className="w-3 h-3" /> Origin
              </span>
              <p className="font-semibold text-xs text-stone-900 mt-0.5">{product.origin}</p>
            </div>

            <div className="bg-cream-100/80 p-3 rounded-xl border border-cream-200">
              <span className="text-[10px] font-bold text-spice-700 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Harvest Season
              </span>
              <p className="font-semibold text-xs text-stone-900 mt-0.5">{product.harvestYear}</p>
            </div>

            <div className="bg-cream-100/80 p-3 rounded-xl border border-cream-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-spice-700 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Purity Guarantee
              </span>
              <p className="font-semibold text-xs text-stone-900 mt-0.5">Cold Stone Milled</p>
            </div>
          </div>

          {/* Aroma & Tasting Notes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              Aromatic Profile & Notes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {product.aromaNotes.map((note) => (
                <span
                  key={note}
                  className="bg-spice-100/80 text-spice-900 border border-spice-200/80 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Culinary Uses */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-spice-700" />
              Chef Pairings & Culinary Uses
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {product.culinaryUses.map((use) => (
                <span
                  key={use}
                  className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              The Harvest Story
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Customer Experiences & Reviews
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(2)} out of 5</span>
              <span className="text-xs text-stone-500">&bull; {reviews.length} reviews</span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-5 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs self-start"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {showReviewForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form Drawer */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-cream-100/70 border border-spice-200 p-6 rounded-2xl space-y-4 animate-fade-in"
          >
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Share Your Tasting Experience
            </h3>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
                {reviewSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          num <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Heat Perception</label>
                <select
                  value={reviewHeat}
                  onChange={(e) => setReviewHeat(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="Zero heat, pure golden warmth">Zero heat, pure golden warmth</option>
                  <option value="Gentle delicate warmth">Gentle delicate warmth</option>
                  <option value="Assertive medium peppery heat">Assertive medium peppery heat</option>
                  <option value="Spicy & vibrant kick">Spicy & vibrant kick</option>
                  <option value="Fiery hot Scoville explosion">Fiery hot Scoville explosion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Headline / Title</label>
              <input
                type="text"
                placeholder="e.g. Unbelievable aroma in my sourdough!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-spice-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Review Comments</label>
              <textarea
                rows={3}
                placeholder="Describe the aroma, bloom in oil, flavor notes, or recipes you made..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-spice-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-6 py-2.5 bg-spice-800 hover:bg-spice-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="divide-y divide-stone-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-6">
              Be the first to review this harvest!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-spice-100 text-spice-800 flex items-center justify-center font-bold text-xs">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block">{rev.userName}</span>
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <Check className="w-3 h-3" /> Verified Spice Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-xs">{rev.title}</h4>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>

                {rev.heatPerception && (
                  <div className="text-[11px] text-stone-500 inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                    <Flame className="w-3 h-3 text-red-500" />
                    Heat: {rev.heatPerception}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
