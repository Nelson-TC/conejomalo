import { NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
