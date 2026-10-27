import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSession();
    const { id } = params;

    const db = getDb();
    const order = db.orders.find(o => o.id === id || o.orderNumber === id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization: User can only view their own order unless Admin/Superadmin
    if (user && user.role === 'USER' && order.userId !== user.id && order.customerEmail !== user.email) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to retrieve order' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { orderStatus, carrier, trackingNumber, notes } = body;

    const db = getDb();
    const order = db.orders.find(o => o.id === id || o.orderNumber === id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.orderStatus;
    if (orderStatus) order.orderStatus = orderStatus;
    if (carrier !== undefined) order.carrier = carrier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (notes !== undefined) order.notes = notes;
    order.updatedAt = new Date().toISOString();

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'ORDER_STATUS_UPDATE',
      details: `Order ${order.orderNumber} status changed from ${oldStatus} to ${order.orderStatus}${trackingNumber ? ` (Tracking: ${trackingNumber})` : ''}.`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
