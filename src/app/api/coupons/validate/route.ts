import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    const db = getDb();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
    }

    if (new Date(coupon.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    const subtotal = Number(cartTotal) || 0;
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({ 
        error: `Minimum order value of $${coupon.minOrderValue} required for this coupon` 
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
      message: `Coupon "${coupon.code}" applied! You save $${discount}`,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
