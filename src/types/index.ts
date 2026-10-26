export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  createdAt: string;
}

export interface ProductVariant {
  weight: string; // e.g. "50g", "100g", "250g", "500g", "1kg"
  price: number;
  originalPrice?: number;
  stock: number;
}

export type SpiceCategory = 
  | 'Whole Spices'
  | 'Ground Spices'
  | 'Blends & Masalas'
  | 'Exotic & Single-Origin'
  | 'Herbs & Seasonings'
  | 'Saffron & Luxury Botanicals';

export interface SpiceProduct {
  id: string;
  name: string;
  slug: string;
  category: SpiceCategory;
  tagline: string;
  description: string;
  origin: string;
  originCountry: string;
  heatLevel: number; // 0 to 4 (0: None/Aromatic, 1: Mild, 2: Medium, 3: Hot, 4: Fiery)
  heatDescription: string;
  aromaNotes: string[];
  culinaryUses: string[];
  harvestYear: string;
  organic: boolean;
  singleOrigin: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  rating: number;
  reviewCount: number;
  stock: number;
  variants: ProductVariant[];
  images: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  category: string;
  stock: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'UPI' | 'COD';

export interface OrderItem {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  shippingMethod: string;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  heatPerception: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  usageCount: number;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 5
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  showAnnouncement: boolean;
  maintenanceMode: boolean;
}
