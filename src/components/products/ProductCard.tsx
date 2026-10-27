'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SpiceProduct, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { HeatIndicator } from './HeatIndicator';
import { Heart, ShoppingBag, Star, Check, Globe } from 'lucide-react';

interface ProductCardProps {
  product: SpiceProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  
  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { weight: '100g', price: 10, stock: 10 }
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-spice-200/80 card-shadow card-shadow-hover flex flex-col justify-between transition-all">
      {/* Top Media & Badges */}
      <div className="relative aspect-square overflow-hidden bg-spice-100/50">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.isBestseller && (
            <span className="bg-spice-900 text-saffron-300 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
              Bestseller
            </span>
          )}
          {product.organic && (
            <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm">
              100% Organic
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-all hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Origin Pill (Bottom of Image) */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-black/60 backdrop-blur-md text-stone-200 px-2 py-0.5 rounded-md">
            <Globe className="w-3 h-3 text-saffron-400" />
            {product.originCountry}
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Heat Meter & Category */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-spice-700 uppercase">
              {product.category}
            </span>
            <HeatIndicator level={product.heatLevel} size="sm" showLabel={true} />
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-spice-700 transition-colors">
            <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Tagline */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-1">
            {product.tagline}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-stone-400">({product.reviewCount})</span>
            {product.stock <= 15 && product.stock > 0 && (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded ml-auto">
                Only {product.stock} left
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-[10px] font-semibold text-red-800 bg-red-100 px-1.5 py-0.5 rounded ml-auto">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Variants & Cart Bar */}
        <div className="pt-2 border-t border-stone-100 flex flex-col gap-2.5">
          {/* Weight variant options */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                onClick={() => setSelectedVariant(v)}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition-all ${
                  selectedVariant.weight === v.weight
                    ? 'bg-spice-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {v.weight}
              </button>
            ))}
          </div>

          {/* Price & Add to Cart button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-stone-900 font-serif">
                  ₹{selectedVariant.price.toFixed(0)}
                </span>
                {selectedVariant.originalPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{selectedVariant.originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                For {selectedVariant.weight}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                product.stock === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-spice-800 hover:bg-spice-900 text-white hover:shadow-md'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
