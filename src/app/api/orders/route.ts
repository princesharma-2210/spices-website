import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { Order, OrderItem } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to view orders' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = getDb();
    let orders: Order[] = [];

    // If Admin or Superadmin, can view all orders
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      orders = [...db.orders];
      if (status && status !== 'ALL') {
        orders = orders.filter(o => o.orderStatus === status);
      }
    } else {
      // Regular customer only views their own orders
      orders = db.orders.filter(o => o.userId === user.id || o.customerEmail === user.email);
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerSession();
    const body = await req.json();

    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      couponCode,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      return NextResponse.json({ error: 'Valid shipping address is required' }, { status: 400 });
    }

    const db = getDb();

    // Calculate subtotal and verify stock
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const it of items) {
      const product = db.products.find(p => p.id === it.productId);
      if (!product) {
        return NextResponse.json({ error: `Product "${it.name}" no longer exists` }, { status: 400 });
      }

      // Check stock
      if (product.stock < it.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.` 
        }, { status: 400 });
      }

      // Decrement product stock
      product.stock -= it.quantity;

      const itemTotal = it.price * it.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: it.productId,
        name: it.name,
        weight: it.weight,
        price: it.price,
        quantity: it.quantity,
        image: it.image,
      });
    }

    // Calculate coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = db.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.type === 'PERCENTAGE') {
          discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        coupon.usageCount += 1;
      }
    }

    // Calculate shipping fee
    const isFreeShipping = (subtotal - discount) >= db.settings.freeShippingThreshold;
    let shippingFee = 0;
    if (!isFreeShipping) {
      shippingFee = shippingMethod === 'EXPRESS' ? db.settings.expressShippingFee : db.settings.standardShippingFee;
    } else if (shippingMethod === 'EXPRESS') {
      // Express upgrade even if threshold met
      shippingFee = 6.99;
    }

    // Tax calculation
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number(((taxableAmount * db.settings.taxRate) / 100).toFixed(2));
    const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

    const orderNumber = `ANJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: user ? user.id : `guest-${Date.now()}`,
      customerName: shippingAddress.fullName,
      customerEmail: user ? user.email : body.email || 'customer@anjalispices.com',
      customerPhone: shippingAddress.phone || '+1 (555) 000-0000',
      items: validatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      couponCode: couponCode || undefined,
      shippingFee: Number(shippingFee.toFixed(2)),
      shippingMethod: shippingMethod === 'EXPRESS' ? 'Express Aroma-Lock (1-2 Days)' : 'Standard Harvest Shipping (3-5 Days)',
      tax,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'CARD',
      paymentStatus: 'PAID', // Instant simulation success
      orderStatus: 'CONFIRMED',
      estimatedDelivery: '3-5 Business Days',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Add customer address to user profile if logged in
    if (user) {
      const dbUser = db.users.find(u => u.id === user.id);
      if (dbUser) {
        const hasAddr = dbUser.addresses.some(a => a.addressLine1 === shippingAddress.addressLine1);
        if (!hasAddr) {
          dbUser.addresses.push({
            ...shippingAddress,
            id: `addr-${Date.now()}`,
            isDefault: dbUser.addresses.length === 0,
          });
        }
      }
    }

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user ? user.id : 'guest',
      userName: shippingAddress.fullName,
      userRole: user ? user.role : 'USER',
      action: 'ORDER_PLACED',
      details: `New order ${orderNumber} placed for $${total} (${validatedItems.length} items).`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
