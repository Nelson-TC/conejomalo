import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

// Cart stored as JSON in cookie: { items: [{ productId: string; qty: number }] }
// Simple, not persistent in DB.

const COOKIE_NAME = 'cart';
interface CartItem { productId: string; qty: number }
interface CartData { items: CartItem[] }
const MAX_ITEMS = 100; // total quantity limit
const MAX_PER_ITEM = 50;

function readCart(): CartData {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return { items: [] };
  try {
    const parsed = JSON.parse(raw);
  if (Array.isArray(parsed.items)) return { items: parsed.items.filter((i: any) => i && i.productId && i.qty > 0) };
    return { items: [] };
  } catch { return { items: [] }; }
}

function writeCart(cart: CartData) {
  cookies().set(COOKIE_NAME, JSON.stringify(cart), { path: '/', httpOnly: false, sameSite: 'lax' });
}

export async function GET() {
  const cart = readCart();
  if (cart.items.length === 0) {
    return new Response(JSON.stringify({ items: [], subtotal: 0, enriched: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  // Fetch products
  const products = await prisma.product.findMany({ where: { id: { in: cart.items.map(i => i.productId) } }, select: { id: true, name: true, price: true, slug: true, imageUrl: true } });
  const map = new Map(products.map((p :any)=> [p.id, p]));
  const enriched = cart.items
    .filter(i => map.has(i.productId))
    .map((i: any) => {
      const p: any = map.get(i.productId)!;
      const price = Number(p.price); // Decimal to number
      const lineTotal = price * i.qty;
  return { ...i, name: p.name, price, lineTotal, slug: p.slug, imageUrl: p.imageUrl };
    });
  const subtotal = enriched.reduce((s, i) => s + i.lineTotal, 0);
  return new Response(JSON.stringify({ items: cart.items, enriched, subtotal }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null) as Partial<CartItem> | null;
  if (!body?.productId || !body.qty || body.qty < 1) {
    return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
  }
  // Validate product exists
  const product = await prisma.product.findUnique({ where: { id: body.productId } });
  if (!product) return new Response(JSON.stringify({ error: 'Producto no existe' }), { status: 404 });
  const cart = readCart();
  const existing = cart.items.find(i => i.productId === body.productId);
  if (existing) existing.qty = Math.min(existing.qty + body.qty, MAX_PER_ITEM); else cart.items.push({ productId: body.productId, qty: Math.min(body.qty, MAX_PER_ITEM) });
  const totalQty = cart.items.reduce((s, i) => s + i.qty, 0);
  if (totalQty > MAX_ITEMS) return new Response(JSON.stringify({ error: 'Limite total superado' }), { status: 400 });
  writeCart(cart);
  return await GET();
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(()=>null) as Partial<CartItem> | null;
  if (!body?.productId || body.qty == null || body.qty < 0) {
    return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
  }
  const cart = readCart();
  const idx = cart.items.findIndex(i => i.productId === body.productId);
  if (idx === -1) return new Response(JSON.stringify({ error: 'No existe' }), { status: 404 });
  if (body.qty === 0) cart.items.splice(idx, 1); else cart.items[idx].qty = Math.min(body.qty, MAX_PER_ITEM);
  const totalQty = cart.items.reduce((s, i) => s + i.qty, 0);
  if (totalQty > MAX_ITEMS) return new Response(JSON.stringify({ error: 'Limite total superado' }), { status: 400 });
  writeCart(cart);
  return await GET();
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(()=>null) as Partial<CartItem> | null;
  if (!body?.productId) return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
  const cart = readCart();
  const next = { items: cart.items.filter(i => i.productId !== body.productId) };
  writeCart(next);
  return await GET();
}