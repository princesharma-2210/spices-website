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
    const { id } = params;
    const db = getDb();
    const product = db.products.find(p => p.id === id || p.slug === id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Product get error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
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
    const db = getDb();
    const index = db.products.findIndex(p => p.id === id || p.slug === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existing = db.products[index];
    const updatedProduct = {
      ...existing,
      ...body,
      id: existing.id, // Immutable ID
      slug: existing.slug,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updatedProduct;

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PRODUCT_UPDATE',
      details: `Updated spice: "${updatedProduct.name}" (Stock: ${updatedProduct.stock}, Category: ${updatedProduct.category}).`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    const db = getDb();
    const product = db.products.find(p => p.id === id || p.slug === id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    db.products = db.products.filter(p => p.id !== product.id);

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PRODUCT_DELETE',
      details: `Deleted spice: "${product.name}" from catalog.`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
