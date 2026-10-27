import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ settings: db.settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const db = getDb();

    db.settings = {
      ...db.settings,
      ...body,
    };

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'STORE_SETTINGS_UPDATE',
      details: `Updated store configuration (Currency: ${db.settings.currency}, Tax: ${db.settings.taxRate}%, Free Shipping threshold: $${db.settings.freeShippingThreshold}).`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
