'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, SpiceProduct, ProductVariant } from '@/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: SpiceProduct, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  couponCode: string | null;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  freeShippingProgress: number; // 0 to 100%
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 50.00;
const STANDARD_SHIPPING_FEE = 4.99;
const TAX_RATE = 0.05; // 5%

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('zaffran_cart');
      const savedCoupon = localStorage.getItem('zaffran_coupon');
      const savedDiscount = localStorage.getItem('zaffran_discount');

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedCoupon) setCouponCode(savedCoupon);
      if (savedDiscount) setDiscount(Number(savedDiscount));
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('zaffran_cart', JSON.stringify(cart));
      if (couponCode) {
        localStorage.setItem('zaffran_coupon', couponCode);
        localStorage.setItem('zaffran_discount', discount.toString());
      } else {
        localStorage.removeItem('zaffran_coupon');
        localStorage.removeItem('zaffran_discount');
      }
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, couponCode, discount, isInitialized]);

  const addToCart = (product: SpiceProduct, variant: ProductVariant, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.weight === variant.weight
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
        return next;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productSlug: product.slug,
            name: product.name,
            weight: variant.weight,
            price: variant.price,
            originalPrice: variant.originalPrice,
            quantity: Math.min(quantity, product.stock),
            image: product.images[0] || '',
            category: product.category,
            stock: product.stock,
          },
        ];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, weight: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.weight === weight)));
  };

  const updateQuantity = (productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.weight === weight) {
          return { ...item, quantity: Math.min(quantity, item.stock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem('zaffran_cart');
    localStorage.removeItem('zaffran_coupon');
    localStorage.removeItem('zaffran_discount');
  };

  const subtotal = useMemo(() => {
    return Number(cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Validate coupon when subtotal changes
  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon' };
      }

      setCouponCode(data.coupon.code);
      setDiscount(data.coupon.discountAmount);
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Could not validate coupon' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
  };

  // Shipping & Tax
  const isFreeShipping = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = cart.length === 0 ? 0 : (isFreeShipping ? 0 : STANDARD_SHIPPING_FEE);
  const freeShippingProgress = Math.min(100, Math.round(((subtotal - discount) / FREE_SHIPPING_THRESHOLD) * 100));

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * TAX_RATE).toFixed(2));
  const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        couponCode,
        discount,
        applyCoupon,
        removeCoupon,
        itemCount,
        subtotal,
        tax,
        shippingFee,
        freeShippingProgress,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
