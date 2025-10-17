import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

export const dynamic = 'force-dynamic';
// GET /api/products
// Behavior:
// - Legacy (no query params): returns full list of active products (array)
// - With any param (page/per/sort/q/cat): returns paginated object with filters applied
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const perParam = searchParams.get('per');
    const sortParam = (searchParams.get('sort') || 'new').trim();
    const q = (searchParams.get('q') || '').trim();
    const cat = (searchParams.get('cat') || '').trim(); // accepts category id or slug

    const hasParams = Boolean(pageParam || perParam || sortParam || q || cat);

    // Build filtering
    const where: any = { active: true };
    if (q && q.length >= 2) {
      where.AND = (where.AND || []).concat([
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        }
      ]);
    }
    if (cat) {
      where.AND = (where.AND || []).concat([
        { OR: [ { categoryId: cat }, { category: { slug: cat } } ] }
      ]);
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    switch (sortParam) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'new':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Legacy path: no params -> return full array
    if (!hasParams) {
      const products = await prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy
      });
      return NextResponse.json(products);
    }

    // Paginated path
    const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
    const perRaw = Math.max(parseInt(perParam || '24', 10) || 24, 1);
    const per = Math.min(perRaw, 60);
    const skip = (page - 1) * per;

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: per,
        orderBy,
        include: { category: { select: { id: true, name: true, slug: true } } }
      })
    ]);

    const totalPages = Math.max(Math.ceil(total / per), 1);
    return NextResponse.json({ items, page, per, total, totalPages });
  } catch (e: any) {
    return NextResponse.json({ error: 'Error fetching products', details: e.message }, { status: 500 });
  }
}
