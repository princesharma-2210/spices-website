import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { Review } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const all = searchParams.get('all');

    const db = getDb();
    let reviews = [...db.reviews];

    if (productId) {
      reviews = reviews.filter(r => r.productId === productId && (all === 'true' ? true : r.isApproved));
    }

    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerSession();
    const body = await req.json();
    const { productId, rating, title, comment, heatPerception } = body;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json({ error: 'Please provide rating, title, and comment' }, { status: 400 });
    }

    const db = getDb();
    const product = db.products.find(p => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const isVerified = user ? db.orders.some(o => (o.userId === user.id || o.customerEmail === user.email) && o.items.some(i => i.productId === productId)) : false;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userId: user ? user.id : `guest-${Date.now()}`,
      userName: user ? user.name : body.userName || 'Spices Enthusiast',
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      heatPerception: heatPerception || 'As expected',
      isVerified,
      isApproved: true, // auto approve
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Recalculate product rating
    const productReviews = db.reviews.filter(r => r.productId === productId && r.isApproved);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Number(avgRating.toFixed(2));
    product.reviewCount = productReviews.length;

    saveDb(db);

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { id, isApproved } = await req.json();
    const db = getDb();
    const review = db.reviews.find(r => r.id === id);

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.isApproved = Boolean(isApproved);
    saveDb(db);

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Moderate review error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const db = getDb();
    db.reviews = db.reviews.filter(r => r.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
