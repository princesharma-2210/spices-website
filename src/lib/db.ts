import fs from 'fs';
import path from 'path';
import os from 'os';
import bcrypt from 'bcryptjs';
import { 
  User, 
  SpiceProduct, 
  Order, 
  Review, 
  Coupon, 
  AuditLog, 
  StoreSettings 
} from '@/types';

interface DatabaseSchema {
  users: User[];
  products: SpiceProduct[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
}

/**
 * Resolve a writable directory for the JSON store.
 *
 * - Local development / self-hosting: `<project>/data` (persists across restarts).
 * - Vercel (and similar serverless platforms): the deployment filesystem is
 *   read-only, so we use the per-instance `/tmp` directory. Note that `/tmp` is
 *   ephemeral and not shared between lambda instances — for durable multi-instance
 *   storage set DATA_DIR to a mounted volume or replace this adapter with a real DB.
 * - DATA_DIR can always be set explicitly to a writable path.
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
  if (process.env.VERCEL) return path.join(os.tmpdir(), 'anjali-spices-data');
  return path.join(process.cwd(), 'data');
}

const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Keep the seeded database in memory as a fallback for read-only filesystems.
const MEMORY_DB_KEY = '__anjali_spices_db__';
type GlobalWithDb = typeof globalThis & { [MEMORY_DB_KEY]?: DatabaseSchema };
const globalWithDb = globalThis as GlobalWithDb;

// Store Settings for Anjali Spices (in the style of Priya Foods)
const initialSettings: StoreSettings = {
  storeName: 'Anjali Spices',
  tagline: 'Authentic Indian Spices, Traditional Masalas & Pure Ground Powders',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 5,
  freeShippingThreshold: 499,
  standardShippingFee: 49,
  expressShippingFee: 99,
  supportEmail: 'care@anjalispices.com',
  supportPhone: '+91 (040) 2335-SPICE',
  announcement: '🌿 Traditional Harvest Festival: Enjoy 15% off with code ANJALI15 | Free Express Shipping on orders over ₹499!',
  showAnnouncement: true,
  maintenanceMode: false,
};

// Seed Products inspired by Priya Foods spices collection
const initialProducts: SpiceProduct[] = [
  {
    id: 'prod-1',
    name: 'Anjali Premium Chilli Powder',
    slug: 'anjali-premium-chilli-powder',
    category: 'Spices & Pure Powders',
    tagline: 'Hand-Picked Sun-Dried Guntur Chillies with Natural Red Luster',
    description: 'Prepared from prime harvest Guntur red chillies known for their rich natural capsaicin and vibrant scarlet color. Slow stone-milled with utmost traditional hygiene to retain the natural oils and authentic sharp pungency without any added artificial colors or preservatives.',
    origin: 'Guntur, Andhra Pradesh',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Hot & Sharp (Rich Guntur Heat)',
    aromaNotes: ['Sun-Baked Clay', 'Ripe Pepper', 'Toasted Red Berry', 'Sharp Capsaicin'],
    culinaryUses: ['Tadka Dals', 'Sambar & Rasam', 'Spicy Curries', 'Pickles & Chutneys', 'Tandoori Rubs'],
    harvestYear: '2024 Fresh Harvest',
    organic: true,
    singleOrigin: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 312,
    stock: 140,
    variants: [
      { weight: '100g', price: 50.00, stock: 140 },
      { weight: '200g', price: 100.00, originalPrice: 110.00, stock: 95 },
      { weight: '500g', price: 275.00, originalPrice: 300.00, stock: 45 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CHILLI_1.jpg?v=1702640021',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CHILLI_4.jpg?v=1702640022',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Anjali Turmeric (Haldi) Powder',
    slug: 'anjali-turmeric-haldi-powder',
    category: 'Spices & Pure Powders',
    tagline: 'High-Curcumin Golden Rhizomes from the Heritage Farms of Erode',
    description: 'Sourced from the prime turmeric producing lands of Erode, Tamil Nadu. Carefully steamed, sun-dried, and micro-pulverized to preserve the natural curcumin content. Gives your food the rich, auspicious golden yellow color and unmatched immunity-boosting goodness.',
    origin: 'Erode, Tamil Nadu',
    originCountry: 'India',
    heatLevel: 0,
    heatDescription: 'Zero Heat (Earthy & Healing Golden Warmth)',
    aromaNotes: ['Fresh Earth', 'Warm Ginger', 'Mustard Flower', 'Golden Meadow'],
    culinaryUses: ['Golden Milk (Haldi Doodh)', 'Daily Sabzis', 'Biryanis', 'South Indian Rasam', 'Ayurvedic Elixirs'],
    harvestYear: '2024 Spring Crop',
    organic: true,
    singleOrigin: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.95,
    reviewCount: 420,
    stock: 160,
    variants: [
      { weight: '100g', price: 34.00, stock: 160 },
      { weight: '200g', price: 68.00, originalPrice: 75.00, stock: 110 },
      { weight: '500g', price: 170.00, originalPrice: 195.00, stock: 60 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/TURMERIC_1.jpg?v=1702640061',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/TURMERIC_4.jpg?v=1702640060',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Anjali Coriander (Dhania) Powder',
    slug: 'anjali-coriander-dhania-powder',
    category: 'Spices & Pure Powders',
    tagline: 'Aromatic Green Seed Harvest Roasted for Sweet Citrus Resonance',
    description: 'Ground from the plumpest coriander seeds of Kota and Ramganj Mandi. Lightly toasted on heavy iron griddles to awaken the essential linalool oils before cold granite pulverizing. Adds rich natural body, velvety gravy texture, and a heavenly citrusy floral aroma.',
    origin: 'Kota, Rajasthan',
    originCountry: 'India',
    heatLevel: 0,
    heatDescription: 'Zero Heat (Citrusy Floral Herbaceous)',
    aromaNotes: ['Sweet Lemon Peel', 'Toasted Sage', 'Pine Needle', 'Floral Green Earth'],
    culinaryUses: ['Gravy Curries', 'Korma Bases', 'Dry Bhindi & Aloo Sabzi', 'Poha Seasoning', 'Chutneys'],
    harvestYear: '2024 Fresh Harvest',
    organic: true,
    singleOrigin: true,
    isFeatured: true,
    isBestseller: true,
    rating: 4.88,
    reviewCount: 185,
    stock: 125,
    variants: [
      { weight: '100g (Pack of 2)', price: 70.00, stock: 125 },
      { weight: '500g', price: 175.00, originalPrice: 199.00, stock: 70 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CORIANDER_1_2d52780f-33db-47b2-a06c-e9f30a1eae1a.jpg?v=1724839536',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CORIANDER_4_96367254-f5e1-4552-a56d-ff6ce272d969.jpg?v=1724839536',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Anjali Curry Chilli Powder (Kura Karam)',
    slug: 'anjali-curry-chilli-powder-kura-karam',
    category: 'Spices & Pure Powders',
    tagline: 'The Legendary Andhra Kitchen Secret Blend of Garlic, Cumin & Chillies',
    description: 'The soul of Telugu home cooking. Kura Karam is a beloved heirloom blend of premium sun-dried chillies, toasted cumin, garlic cloves, coriander, and curry leaves. Just add one spoonful directly to dry vegetable fries (Vepudu) or curries for instant grandmother-style flavor.',
    origin: 'Andhra Pradesh Heritage',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Spicy & Savory (Garlic & Cumin Kick)',
    aromaNotes: ['Roasted Garlic', 'Cumin Snap', 'Toasted Chilli', 'Curry Leaf Essence'],
    culinaryUses: ['Aloo Vepudu (Potato Fry)', 'Bendakaya Vepudu (Okra Fry)', 'Dondakaya Fry', 'Egg Curry', 'Paratha Seasoning'],
    harvestYear: '2024 Fresh Batch',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.96,
    reviewCount: 260,
    stock: 90,
    variants: [
      { weight: '100g', price: 65.00, stock: 90 },
      { weight: '250g', price: 155.00, originalPrice: 175.00, stock: 65 },
      { weight: '500g', price: 300.00, originalPrice: 340.00, stock: 40 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/KuraKaram100gfront.jpg?v=1788238300',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/KuraKaram100gback.jpg?v=1788238300',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Anjali Premium Sambar Powder',
    slug: 'anjali-premium-sambar-powder',
    category: 'Authentic Masala Powders',
    tagline: 'Authentic South Indian Temple-Style Recipe with Roasted Lentils & Asafoetida',
    description: 'Crafted according to time-honored South Indian traditions. Combines slow-roasted toor dal, chana dal, coriander, fenugreek, red chillies, black pepper, and premium compounded asafoetida. Imparts irresistible aroma, golden thickness, and classic temple-feast flavor to your sambar.',
    origin: 'Thanjavur, Tamil Nadu',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Medium (Aromatic, Tangy Lentil Warmth)',
    aromaNotes: ['Fenugreek Herb', 'Roasted Lentils', 'Asafoetida Zing', 'Curry Leaves'],
    culinaryUses: ['Drumstick Sambar', 'Idli-Dosa Dip', 'Mixed Vegetable Sambar', 'Mini Idli Bowl'],
    harvestYear: '2024 Fresh Blend',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.92,
    reviewCount: 380,
    stock: 150,
    variants: [
      { weight: '100g', price: 60.00, stock: 150 },
      { weight: '200g', price: 115.00, originalPrice: 125.00, stock: 95 },
      { weight: '500g', price: 265.00, originalPrice: 300.00, stock: 50 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/products/100gPremiumSambarFront_d90cf11c-6f66-42c5-8d23-6931bbe032fe.jpg?v=1666430990',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/products/100gPremiumSambarBack_b04fd343-2faf-4162-aa97-2b2670367628.jpg?v=1666430990',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Anjali Premium Rasam Powder',
    slug: 'anjali-premium-rasam-powder',
    category: 'Authentic Masala Powders',
    tagline: 'Coarsely Ground Tellicherry Black Pepper & Cumin for Soul-Soothing Rasam',
    description: 'Nothing heals the soul like a steaming bowl of hot pepper rasam. Anjali Premium Rasam Powder features the exact traditional proportion of crushed whole black peppercorns, cumin, coriander, and red chillies. Guarantees a fragrant, appetizing rasam that warms you from inside.',
    origin: 'Mysore, Karnataka',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Medium Peppery (Cumin & Black Pepper Bite)',
    aromaNotes: ['Cracked Pepper', 'Toasted Jeera', 'Tamarind Harmony', 'Curry Leaf'],
    culinaryUses: ['Tomato Rasam', 'Garlic Pepper Rasam', 'Lemon Rasam', 'Rasam Rice with Ghee', 'Warm Soup Sip'],
    harvestYear: '2024 Fresh Blend',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.94,
    reviewCount: 290,
    stock: 110,
    variants: [
      { weight: '100g', price: 60.00, stock: 110 },
      { weight: '200g', price: 115.00, originalPrice: 130.00, stock: 80 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/RASAMPOWDER_1.jpg?v=1703150391',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/RASAMPOWDER_4.jpg?v=1703150391',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Anjali Traditional Garam Masala Powder',
    slug: 'anjali-traditional-garam-masala-powder',
    category: 'Authentic Masala Powders',
    tagline: 'Royal Heirloom Blend of 12 Roasted Botanicals with Mace & Black Cardamom',
    description: 'An aristocrat among masalas. Roasted in small batches and gently ground to protect the natural oils of black cardamom, cinnamon quills, cloves, star anise, nutmeg, and stone flower. Add just 1/2 teaspoon towards the end of cooking for deep royal culinary aroma.',
    origin: 'Hyderabad & Delhi Heritage',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Warm & Fragrant (Sweet Spice Complexity)',
    aromaNotes: ['Nutmeg & Mace', 'Cinnamon Bark', 'Smoked Clove', 'Royal Caraway'],
    culinaryUses: ['Paneer Makhani', 'Chicken Curry', 'Chole Masala', 'Mushroom Gravy', 'Mutton Rogan Josh'],
    harvestYear: '2024 Fresh Blend',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.91,
    reviewCount: 340,
    stock: 135,
    variants: [
      { weight: '50g', price: 45.00, stock: 135 },
      { weight: '100g', price: 80.00, originalPrice: 90.00, stock: 90 },
      { weight: '200g', price: 150.00, originalPrice: 175.00, stock: 50 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/GARAMMASALA_1.jpg?v=1705735292',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/GARAMMASALA_3.jpg?v=1705735291',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Anjali Hyderabadi Chicken Biryani Masala',
    slug: 'anjali-hyderabadi-chicken-biryani-masala',
    category: 'Regional Biryani & Curry Blends',
    tagline: 'Nizam-Style Dum Biryani Formula with Shahi Jeera, Mace & Green Cardamoms',
    description: 'Replicate the magic of legendary Hyderabadi Dum Biryani in your own kitchen! Infused with whole royal shahi jeera, javitri (mace), black stone flower (dagad phool), green cardamom, and aromatic red chillies for an authentic restaurant-style aroma.',
    origin: 'Old City, Hyderabad',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Spicy & Royal (Authentic Dum Biryani Heat)',
    aromaNotes: ['Shahi Jeera', 'Green Cardamom', 'Javitri Blades', 'Kashmiri Saffron Essence'],
    culinaryUses: ['Hyderabadi Chicken Dum Biryani', 'Kolkata Biryani', 'Kushka Rice', 'Biryani Gravy (Salan)'],
    harvestYear: '2024 Fresh Batch',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.97,
    reviewCount: 512,
    stock: 170,
    variants: [
      { weight: '50g', price: 50.00, stock: 170 },
      { weight: '100g', price: 95.00, originalPrice: 110.00, stock: 120 },
      { weight: '200g', price: 180.00, originalPrice: 210.00, stock: 65 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/Hyderabadchickenbiryanimasalacopy.jpg?v=1788170152',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/Hyderabadchickenbiryanimasala50g2.jpg?v=1788170151',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-9',
    name: 'Anjali Hyderabadi Mutton Biryani Masala',
    slug: 'anjali-hyderabadi-mutton-biryani-masala',
    category: 'Regional Biryani & Curry Blends',
    tagline: 'Deeply Fragrant Meat Tenderizing Blend for Succulent Royal Mutton Biryani',
    description: 'Specifically crafted for succulent, fall-off-the-bone Mutton Dum Biryani. Combines dried raw papaya essence, nutmeg, star anise, black pepper, and cinnamon to tenderize meat while infusing intense aromatic notes into every long grain of basmati rice.',
    origin: 'Hyderabad, Telangana',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Hot & Robust (Meat Infused Rich Heat)',
    aromaNotes: ['Nutmeg', 'Star Anise', 'Black Pepper', 'Toasted Coriander'],
    culinaryUses: ['Hyderabadi Kachche Gosht ki Biryani', 'Mutton Pulao', 'Yakhni Biryani'],
    harvestYear: '2024 Fresh Batch',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: false,
    rating: 4.92,
    reviewCount: 198,
    stock: 85,
    variants: [
      { weight: '50g', price: 50.00, stock: 85 },
      { weight: '100g', price: 95.00, originalPrice: 110.00, stock: 60 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/hyderabadmuttonbiryanimasala.jpg?v=1788170256',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/hyderabadmuttonbiryanimasala50g2.jpg?v=1788170256',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    name: 'Anjali Andhra Chicken Masala',
    slug: 'anjali-andhra-chicken-masala',
    category: 'Regional Biryani & Curry Blends',
    tagline: 'Fiery Rayalaseema Style Kodi Kura Masala with Poppy Seeds & Guntur Mirch',
    description: 'For lovers of authentic, fiery Andhra chicken curries! Blended with Guntur S4 chillies, khus-khus (poppy seeds), black pepper, cloves, and roasted cumin. Creates that iconic dark crimson, mouth-tingling Andhra chicken gravy beloved across South India.',
    origin: 'Rayalaseema & Guntur',
    originCountry: 'India',
    heatLevel: 4,
    heatDescription: 'Fiery Hot (Assertive Andhra Kodi Kura Punch)',
    aromaNotes: ['Roasted Pepper', 'Hot Chilli Oil', 'Poppy Seed Cream', 'Clove Zing'],
    culinaryUses: ['Andhra Kodi Kura', 'Country Chicken (Natukodi) Curry', 'Chicken Sukka', 'Pepper Chicken'],
    harvestYear: '2024 Fresh Harvest',
    organic: true,
    singleOrigin: false,
    isFeatured: true,
    isBestseller: true,
    rating: 4.93,
    reviewCount: 310,
    stock: 120,
    variants: [
      { weight: '50g', price: 50.00, stock: 120 },
      { weight: '100g', price: 95.00, originalPrice: 110.00, stock: 85 },
      { weight: '200g', price: 180.00, originalPrice: 215.00, stock: 45 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/AndhraChickenMasala100gFront.jpg?v=1788172902',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/AndhraChickenMasala100gback.jpg?v=1788172902',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-11',
    name: 'Anjali Chicken 65 Masala',
    slug: 'anjali-chicken-65-masala',
    category: 'Regional Biryani & Curry Blends',
    tagline: 'Crispy, Tangy, Garlic-Infused Chennai Starter Seasoning',
    description: 'The indisputable king of South Indian appetizers! Anjali Chicken 65 Masala coats bone-in or boneless chicken pieces with an irresistible crimson crust, vibrant garlic flavor, fresh curry leaf tang, and crisp texture without needing extra colorants.',
    origin: 'Chennai, Tamil Nadu',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Spicy & Tangy (Crisp Barbecue Heat)',
    aromaNotes: ['Crispy Garlic', 'Curry Leaf Spice', 'Tangy Amchur', 'Red Capsicum'],
    culinaryUses: ['Chicken 65', 'Paneer 65', 'Gobi 65', 'Mushroom 65', 'Crispy Corn Starter'],
    harvestYear: '2024 Fresh Batch',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.89,
    reviewCount: 220,
    stock: 105,
    variants: [
      { weight: '50g', price: 50.00, stock: 105 },
      { weight: '100g', price: 95.00, originalPrice: 105.00, stock: 75 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CHICKEN65MASALA.jpg?v=1788169259',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/Chicken6550g3.jpg?v=1788169259',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-12',
    name: 'Anjali Fish Fry Masala',
    slug: 'anjali-fish-fry-masala',
    category: 'Regional Biryani & Curry Blends',
    tagline: 'Coastal Coromandel Seafood Rub with Ajwain, Kashmiri Chilli & Lemon Salt',
    description: 'Crafted for coastal seafood purists. Features a delicious blend of Kashmiri chilli, carom seeds (ajwain), amchur, cumin, and dry ginger. Creates a tight, flavorful marinade that adheres to fish steaks and delivers a golden, crunchy crust when pan-tossed in oil.',
    origin: 'Coastal Andhra & Coromandel',
    originCountry: 'India',
    heatLevel: 3,
    heatDescription: 'Spicy & Tangy Coastal Heat',
    aromaNotes: ['Carom Seed Snap', 'Zesty Lemon Salt', 'Kashmiri Red Rub', 'Dry Ginger'],
    culinaryUses: ['Vanjaram (Seer Fish) Fry', 'Pomfret Tawa Fry', 'Prawn Masala Fry', 'Squid Roast'],
    harvestYear: '2024 Coastal Batch',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.88,
    reviewCount: 165,
    stock: 95,
    variants: [
      { weight: '50g', price: 40.00, stock: 95 },
      { weight: '100g', price: 75.00, originalPrice: 85.00, stock: 65 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/FISHFRYMASALA.jpg?v=1788169801',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/Fishfrymasala50g5.jpg?v=1788169800',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-13',
    name: 'Anjali Traditional Puliogare Powder (Tamarind Rice Mix)',
    slug: 'anjali-traditional-puliogare-powder',
    category: 'Traditional South Indian Powders',
    tagline: 'Classic South Indian Temple-Style Pulihora with Roasted Sesame & Peanuts',
    description: 'Recreate beloved temple-style Tamarind Rice (Puliogare/Pulihora) in minutes! Handcrafted with roasted white sesame, peanuts, chana dal, fenugreek, compounded hing, and sun-dried chillies. Mix with hot steamed rice and a spoonful of sesame oil for heavenly flavor.',
    origin: 'Temple Tradition, South India',
    originCountry: 'India',
    heatLevel: 1,
    heatDescription: 'Gentle Warmth (Tangy, Nutty, Sesame Crunch)',
    aromaNotes: ['Toasted Sesame', 'Crunchy Peanuts', 'Asafoetida', 'Red Chilli Snap'],
    culinaryUses: ['Temple Puliogare Rice', 'Lunchbox Tamarind Rice', 'Festival Prasadam', 'Pulihora Sev'],
    harvestYear: '2024 Fresh Harvest',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.95,
    reviewCount: 240,
    stock: 130,
    variants: [
      { weight: '50g', price: 35.00, stock: 130 },
      { weight: '100g', price: 65.00, originalPrice: 75.00, stock: 90 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/PULIOGAREPOWDER6.jpg?v=1788171667',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/PULIOGAREPOWDER50g2.jpg?v=1788171667',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-14',
    name: 'Anjali Gutti Vankaya Kura Masala (Stuffed Brinjal)',
    slug: 'anjali-gutti-vankaya-kura-masala',
    category: 'Traditional South Indian Powders',
    tagline: 'Authentic Telugu Heritage Paste Powder for Baby Brinjals & Stuffed Curries',
    description: 'Gutti Vankaya is considered the crowned jewel of Telugu vegetarian feasts. This master blend of roasted peanuts, sesame seeds, coriander, cumin, dry coconut, and cloves is designed specifically to be stuffed into slit purple brinjals and braised in gravy.',
    origin: 'Coastal Andhra Cuisine',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Medium (Nutty, Roasted Coconut & Clove)',
    aromaNotes: ['Roasted Peanuts', 'Dry Coconut Copra', 'Clove & Cinnamon', 'Coriander Seed'],
    culinaryUses: ['Gutti Vankaya Kura (Stuffed Brinjal)', 'Stuffed Capsicum', 'Bagara Baingan', 'Paneer Stuffed Dum'],
    harvestYear: '2024 Fresh Crop',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.93,
    reviewCount: 175,
    stock: 80,
    variants: [
      { weight: '50g', price: 50.00, stock: 80 },
      { weight: '100g', price: 95.00, originalPrice: 110.00, stock: 55 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/guttivankayakuramasala.jpg?v=1788169966',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/guttivankayakuramasala50gback.jpg?v=1788169966',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-15',
    name: 'Anjali Bisibele Bhath Masala',
    slug: 'anjali-bisibele-bhath-masala',
    category: 'Traditional South Indian Powders',
    tagline: 'Authentic Karnataka Spice Blend with Marathi Moggu, Copra & Kapok Buds',
    description: 'The authentic taste of Karnataka’s famous hot lentil-rice dish. Featuring rare aromatic Marathi Moggu (Kapok buds), true cinnamon, roasted coriander, desiccated copra, and chana dal. Imparts the signature rich dark color and irresistible fragrant aroma.',
    origin: 'Mysore, Karnataka',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Medium (Cinnamon & Kapok Bud Warmth)',
    aromaNotes: ['Marathi Moggu Buds', 'Copra Coconut', 'Cinnamon Quills', 'Roasted Toor Dal'],
    culinaryUses: ['Karnataka Bisi Bele Bath', 'Khara Pongal', 'Mixed Vegetable Dal Rice', 'Spiced Poha'],
    harvestYear: '2024 Fresh Blend',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: false,
    rating: 4.87,
    reviewCount: 140,
    stock: 95,
    variants: [
      { weight: '50g', price: 50.00, stock: 95 },
      { weight: '100g', price: 95.00, originalPrice: 110.00, stock: 65 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/BisibeleBhathMasala.jpg?v=1788168620',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/BisibeleBhathMasala2.jpg?v=1788168620',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-16',
    name: 'Anjali Pav Bhaji Masala',
    slug: 'anjali-pav-bhaji-masala',
    category: 'Authentic Masala Powders',
    tagline: 'Mumbai Street-Side Buttery Bhaji Seasoning with Amchur & Black Salt',
    description: 'Brings Chowpatty street food magic straight to your kitchen! A zesty, pungent blend of dried green mango (amchur), black salt, roasted cumin, fennel seeds, and coriander. Mashes flawlessly into boiled potatoes, tomatoes, and butter for mouth-watering bhaji.',
    origin: 'Mumbai Street Heritage',
    originCountry: 'India',
    heatLevel: 2,
    heatDescription: 'Medium (Tangy Amchur & Buttery Cumin)',
    aromaNotes: ['Tangy Green Mango', 'Kala Namak', 'Roasted Saunf (Fennel)', 'Coriander'],
    culinaryUses: ['Mumbai Pav Bhaji', 'Tawa Pulao', 'Veg Masala Toast', 'Cheese Bhaji Paratha'],
    harvestYear: '2024 Fresh Crop',
    organic: true,
    singleOrigin: false,
    isFeatured: false,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 215,
    stock: 110,
    variants: [
      { weight: '50g', price: 40.00, stock: 110 },
      { weight: '100g', price: 75.00, originalPrice: 85.00, stock: 75 },
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/pavbhajimasala50g.jpg?v=1788163409',
      'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/pavbhajimasala50gBack.jpg?v=1788163409',
    ],
    createdAt: new Date().toISOString(),
  },
];

// Seed initial users with bcrypt hashed passwords
const createInitialUsers = (): User[] => {
  const salt = bcrypt.genSaltSync(10);
  return [
    {
      id: 'usr-superadmin',
      name: 'Anjali Sharma (Superadmin)',
      email: 'superadmin@anjalispices.com',
      password: bcrypt.hashSync('superadmin123', salt),
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98490 12345',
      addresses: [
        {
          id: 'addr-super-1',
          fullName: 'Anjali Sharma',
          phone: '+91 98490 12345',
          addressLine1: 'Plot No. 42, Jubilee Hills, Road No. 36',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500033',
          country: 'India',
          isDefault: true,
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-admin',
      name: 'Ramesh Verma (Admin)',
      email: 'admin@anjalispices.com',
      password: bcrypt.hashSync('admin123', salt),
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98850 67890',
      addresses: [
        {
          id: 'addr-admin-1',
          fullName: 'Ramesh Verma',
          phone: '+91 98850 67890',
          addressLine1: '12 Spice Market Arcade, Somajiguda',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500082',
          country: 'India',
          isDefault: true,
        }
      ],
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
      id: 'usr-customer',
      name: 'Priya Sundaram (Customer)',
      email: 'user@anjalispices.com',
      password: bcrypt.hashSync('user123', salt),
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      phone: '+91 98200 45678',
      addresses: [
        {
          id: 'addr-cust-1',
          fullName: 'Priya Sundaram',
          phone: '+91 98200 45678',
          addressLine1: 'A-402, Kaveri Enclave, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true,
        }
      ],
      createdAt: '2024-02-10T00:00:00.000Z',
    },
    {
      id: 'usr-customer-2',
      name: 'Rajesh Kulkarni',
      email: 'rajesh@example.com',
      password: bcrypt.hashSync('password123', salt),
      role: 'USER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phone: '+91 97110 33445',
      addresses: [
        {
          id: 'addr-cust-2',
          fullName: 'Rajesh Kulkarni',
          phone: '+91 97110 33445',
          addressLine1: 'Flat 12, Deccan Heights, Kothrud',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411038',
          country: 'India',
          isDefault: true,
        }
      ],
      createdAt: '2024-03-01T00:00:00.000Z',
    }
  ];
};

// Seed initial orders in INR ₹
const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ANJ-8291',
    userId: 'usr-customer',
    customerName: 'Priya Sundaram',
    customerEmail: 'user@anjalispices.com',
    customerPhone: '+91 98200 45678',
    items: [
      {
        productId: 'prod-1',
        name: 'Anjali Premium Chilli Powder',
        weight: '200g',
        price: 100.00,
        quantity: 2,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/CHILLI_1.jpg?v=1702640021',
      },
      {
        productId: 'prod-5',
        name: 'Anjali Premium Sambar Powder',
        weight: '200g',
        price: 115.00,
        quantity: 1,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/products/100gPremiumSambarFront_d90cf11c-6f66-42c5-8d23-6931bbe032fe.jpg?v=1666430990',
      },
      {
        productId: 'prod-8',
        name: 'Anjali Hyderabadi Chicken Biryani Masala',
        weight: '100g',
        price: 95.00,
        quantity: 2,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/Hyderabadchickenbiryanimasalacopy.jpg?v=1788170152',
      }
    ],
    subtotal: 505.00,
    discount: 75.75,
    couponCode: 'ANJALI15',
    shippingFee: 0.00,
    shippingMethod: 'Express Aroma-Lock (Free over ₹499)',
    tax: 21.46,
    total: 450.71,
    shippingAddress: {
      id: 'addr-cust-1',
      fullName: 'Priya Sundaram',
      phone: '+91 98200 45678',
      addressLine1: 'A-402, Kaveri Enclave, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      isDefault: true,
    },
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    carrier: 'BlueDart Express',
    trackingNumber: 'BLU-ANJ-789210',
    estimatedDelivery: 'Delivered',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord-1002',
    orderNumber: 'ANJ-8340',
    userId: 'usr-customer-2',
    customerName: 'Rajesh Kulkarni',
    customerEmail: 'rajesh@example.com',
    customerPhone: '+91 97110 33445',
    items: [
      {
        productId: 'prod-4',
        name: 'Anjali Curry Chilli Powder (Kura Karam)',
        weight: '250g',
        price: 155.00,
        quantity: 1,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/KuraKaram100gfront.jpg?v=1788238300',
      },
      {
        productId: 'prod-2',
        name: 'Anjali Turmeric (Haldi) Powder',
        weight: '500g',
        price: 170.00,
        quantity: 1,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/TURMERIC_1.jpg?v=1702640061',
      },
      {
        productId: 'prod-7',
        name: 'Anjali Traditional Garam Masala Powder',
        weight: '100g',
        price: 80.00,
        quantity: 2,
        image: 'https://cdn.shopify.com/s/files/1/0587/5410/5495/files/GARAMMASALA_1.jpg?v=1705735292',
      }
    ],
    subtotal: 485.00,
    discount: 0.00,
    shippingFee: 49.00,
    shippingMethod: 'Standard Courier (3-5 Days)',
    tax: 26.70,
    total: 560.70,
    shippingAddress: {
      id: 'addr-cust-2',
      fullName: 'Rajesh Kulkarni',
      phone: '+91 97110 33445',
      addressLine1: 'Flat 12, Deccan Heights, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411038',
      country: 'India',
      isDefault: true,
    },
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPED',
    carrier: 'Delhivery Surface',
    trackingNumber: 'DLV-994012984',
    estimatedDelivery: 'Tomorrow by 2:00 PM',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Seed reviews
const initialReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'usr-customer',
    userName: 'Priya Sundaram',
    rating: 5,
    title: 'Authentic Guntur Chilli heat - just like homemade!',
    comment: 'The color and aroma are identical to the traditional fresh sun-dried chillies my grandmother used to powder. No synthetic redness, just pure rich flavor and great pungency in my rasam and sambar.',
    heatPerception: 'Proper authentic Guntur heat',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'prod-4',
    userId: 'usr-customer-2',
    userName: 'Rajesh Kulkarni',
    rating: 5,
    title: 'Kura Karam is magic for vegetable fry',
    comment: 'Tossed this with potato fry and dondakaya (tindora) fry. The garlic, cumin, and chilli balance is perfection. We are hooked!',
    heatPerception: 'Spicy with wonderful roasted garlic kick',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'prod-8',
    userId: 'usr-customer',
    userName: 'Priya Sundaram',
    rating: 5,
    title: 'Hyderabadi Biryani turned out restaurant-style!',
    comment: 'You can actually smell the shahi jeera, mace blades, and green cardamom. The whole house was filled with the fragrance of authentic dum biryani.',
    heatPerception: 'Perfect aromatic spice',
    isVerified: true,
    isApproved: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

// Seed coupons
const initialCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'ANJALI15',
    type: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 299,
    isActive: true,
    usageCount: 88,
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    id: 'coup-2',
    code: 'FIRSTORDER',
    type: 'FIXED',
    discountValue: 50,
    minOrderValue: 399,
    isActive: true,
    usageCount: 34,
    expiresAt: '2027-12-31T23:59:59.000Z',
  },
  {
    id: 'coup-3',
    code: 'FREESHIP',
    type: 'FIXED',
    discountValue: 49,
    minOrderValue: 349,
    isActive: true,
    usageCount: 22,
    expiresAt: '2027-12-31T23:59:59.000Z',
  }
];

// Seed audit logs
const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'usr-superadmin',
    userName: 'Anjali Sharma',
    userRole: 'SUPERADMIN',
    action: 'SYSTEM_INITIALIZATION',
    details: 'Anjali Spices platform initialized with 16 authentic Indian spices & masala listings styled after Priya Foods.',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'log-2',
    userId: 'usr-admin',
    userName: 'Ramesh Verma',
    userRole: 'ADMIN',
    action: 'INVENTORY_RESTOCK',
    details: 'Restocked Anjali Premium Chilli Powder and Sambar Powder (+150 units).',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'log-3',
    userId: 'usr-superadmin',
    userName: 'Anjali Sharma',
    userRole: 'SUPERADMIN',
    action: 'ROLE_UPDATE',
    details: 'Assigned Ramesh Verma the ADMIN role.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

// Build a brand-new database from the seeded demo data.
export function createInitialDb(): DatabaseSchema {
  return {
    users: createInitialUsers(),
    products: clone(initialProducts),
    orders: clone(initialOrders),
    reviews: clone(initialReviews),
    coupons: clone(initialCoupons),
    auditLogs: clone(initialAuditLogs),
    settings: clone(initialSettings),
  };
}

function normalizeDb(value: unknown): DatabaseSchema | null {
  if (!value || typeof value !== 'object') return null;

  const data = value as Partial<DatabaseSchema>;
  if (!Array.isArray(data.users) || !Array.isArray(data.products)) return null;

  return {
    users: data.users,
    products: data.products,
    orders: Array.isArray(data.orders) ? data.orders : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    coupons: Array.isArray(data.coupons) ? data.coupons : [],
    auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
    settings: { ...initialSettings, ...(data.settings ?? {}) },
  };
}

function loadDbFromDisk(): DatabaseSchema | null {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return normalizeDb(JSON.parse(raw));
  } catch (err) {
    console.error('Error reading database file:', err);
    return null;
  }
}

function persistDb(db: DatabaseSchema): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem (e.g. a serverless deployment without /tmp access).
    // Keep serving from the in-memory copy instead of failing the request.
    console.error('Error saving database file, keeping changes in memory:', err);
  }
}

// Helper to load or initialize DB
export function getDb(): DatabaseSchema {
  if (globalWithDb[MEMORY_DB_KEY]) {
    return globalWithDb[MEMORY_DB_KEY] as DatabaseSchema;
  }

  const db = loadDbFromDisk() ?? createInitialDb();
  globalWithDb[MEMORY_DB_KEY] = db;

  // Proactively create the store file when the filesystem is writable.
  if (!fs.existsSync(DB_FILE)) {
    persistDb(db);
  }

  return db;
}

export function saveDb(db: DatabaseSchema): void {
  globalWithDb[MEMORY_DB_KEY] = db;
  persistDb(db);
}

// Reset Database to clean state
export function resetDb(): DatabaseSchema {
  const freshDb = createInitialDb();
  freshDb.auditLogs = [
    ...freshDb.auditLogs,
    {
      id: `log-${Date.now()}`,
      userId: 'usr-superadmin',
      userName: 'Anjali Sharma',
      userRole: 'SUPERADMIN',
      action: 'DATABASE_RESET',
      details: 'Store database was reset to pristine factory state with Anjali Spices datasets.',
      createdAt: new Date().toISOString(),
    },
  ];
  saveDb(freshDb);
  return freshDb;
}
