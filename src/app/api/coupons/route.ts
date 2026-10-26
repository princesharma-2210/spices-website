import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { Coupon } from '@/types';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    return NextResponse.json({ coupons: db.coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, discountValue, minOrderValue, expiresAt } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and discount value are required' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type: type || 'PERCENTAGE',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      isActive: true,
      usageCount: 0,
      expiresAt: expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
    };

    db.coupons.unshift(newCoupon);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'COUPON_CREATED',
      details: `Created promo code: "${newCoupon.code}" (${newCoupon.discountValue}${newCoupon.type === 'PERCENTAGE' ? '%' : '$'} off).`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }

    const db = getDb();
    const coupon = db.coupons.find(c => c.id === id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    db.coupons = db.coupons.filter(c => c.id !== id);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'COUPON_DELETED',
      details: `Deleted promo code: "${coupon.code}".`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
