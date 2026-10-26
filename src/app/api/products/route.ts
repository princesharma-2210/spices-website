import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth';
import { SpiceProduct } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const heat = searchParams.get('heat');
    const search = searchParams.get('search')?.toLowerCase();
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    const organic = searchParams.get('organic');
    const sort = searchParams.get('sort'); // price-asc, price-desc, rating, heat-asc, heat-desc, newest

    const db = getDb();
    let products = [...db.products];

    // Filter by Category
    if (category && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Heat Level
    if (heat !== null && heat !== undefined && heat !== 'all' && heat !== '') {
      const heatNum = parseInt(heat, 10);
      if (!isNaN(heatNum)) {
        products = products.filter(p => p.heatLevel === heatNum);
      }
    }

    // Search query
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.origin.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.aromaNotes.some(n => n.toLowerCase().includes(search)) ||
        p.culinaryUses.some(u => u.toLowerCase().includes(search))
      );
    }

    // Featured / Bestseller / Organic flags
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    if (bestseller === 'true') {
      products = products.filter(p => p.isBestseller);
    }
    if (organic === 'true') {
      products = products.filter(p => p.organic);
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          products.sort((a, b) => a.variants[0].price - b.variants[0].price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.variants[0].price - a.variants[0].price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'heat-asc':
          products.sort((a, b) => a.heatLevel - b.heatLevel);
          break;
        case 'heat-desc':
          products.sort((a, b) => b.heatLevel - a.heatLevel);
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          break;
      }
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getServerSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      category,
      tagline,
      description,
      origin,
      originCountry,
      heatLevel,
      heatDescription,
      aromaNotes,
      culinaryUses,
      harvestYear,
      organic,
      singleOrigin,
      variants,
      images,
      stock,
    } = body;

    if (!name || !category || !variants || variants.length === 0) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const db = getDb();

    const newProduct: SpiceProduct = {
      id: `prod-${Date.now()}`,
      name,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      category,
      tagline: tagline || '',
      description: description || '',
      origin: origin || 'Artisanal Estate',
      originCountry: originCountry || 'Global',
      heatLevel: Number(heatLevel) || 0,
      heatDescription: heatDescription || 'Balanced warmth',
      aromaNotes: Array.isArray(aromaNotes) ? aromaNotes : (aromaNotes ? aromaNotes.split(',').map((s: string) => s.trim()) : []),
      culinaryUses: Array.isArray(culinaryUses) ? culinaryUses : (culinaryUses ? culinaryUses.split(',').map((s: string) => s.trim()) : []),
      harvestYear: harvestYear || `${new Date().getFullYear()} Fresh Harvest`,
      organic: Boolean(organic),
      singleOrigin: Boolean(singleOrigin),
      isFeatured: Boolean(body.isFeatured),
      isBestseller: Boolean(body.isBestseller),
      rating: 5.0,
      reviewCount: 0,
      stock: Number(stock) || 50,
      variants,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'],
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);

    // Audit log
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PRODUCT_CREATE',
      details: `Created new spice: "${newProduct.name}" in category "${newProduct.category}".`,
      createdAt: new Date().toISOString(),
    });

    saveDb(db);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
