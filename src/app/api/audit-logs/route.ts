import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
    }

    const db = getDb();
    return NextResponse.json({ logs: db.auditLogs });
  } catch (error) {
    console.error('Fetch logs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 });
  }
}
