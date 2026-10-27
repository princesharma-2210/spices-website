import { NextResponse } from 'next/server';
import { resetDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await getServerSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
    }

    const freshDb = resetDb();

    return NextResponse.json({
      success: true,
      message: 'Store demo data was successfully reset to default state.',
      productCount: freshDb.products.length,
      orderCount: freshDb.orders.length,
    });
  } catch (error) {
    console.error('Reset data error:', error);
    return NextResponse.json({ error: 'Failed to reset store data' }, { status: 500 });
  }
}
