import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-server';

const CART_COOKIE = 'cart';

function readCart(): { items: { productId: string; qty: number }[] } {
	const raw = cookies().get(CART_COOKIE)?.value;
	if (!raw) return { items: [] };
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed.items)) return { items: parsed.items.filter((i: any) => i && i.productId && i.qty > 0) };
		return { items: [] };
	} catch { return { items: [] }; }
}

function clearCart() {
	cookies().set(CART_COOKIE, JSON.stringify({ items: [] }), { path: '/', httpOnly: false, sameSite: 'lax' });
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(()=>null) as any;
		const errors: Record<string,string> = {};
		function reqField(field: string, min=1) {
			const v = body?.[field];
			if (typeof v !== 'string' || v.trim().length < min) errors[field] = `Requerido (min ${min})`;
			return v as string | undefined;
		}
		const customer = reqField('customer', 2);
		const email = reqField('email', 5);
		const phone = reqField('phone', 5);
		const address = reqField('address', 5);
		// Validaciones específicas
		if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email inválido';
		if (phone && !/^[+0-9 ()-]{5,}$/.test(phone)) errors.phone = 'Teléfono inválido';
		if (Object.keys(errors).length) return new Response(JSON.stringify({ error: 'Validación', fields: errors }), { status: 422 });
		const cart = readCart();
		if (cart.items.length === 0) return new Response(JSON.stringify({ error: 'Carrito vacío' }), { status: 400 });
		const products = await prisma.product.findMany({ where: { id: { in: cart.items.map(i => i.productId) } }, select: { id: true, price: true, name: true, slug: true } });
		if (products.length === 0) return new Response(JSON.stringify({ error: 'Productos no encontrados' }), { status: 400 });
		const map: Map<string, { id: string; price: any; name: string; slug: string }> = new Map(products.map((p: any) => [p.id, p]));
		const orderItemsData = cart.items
			.filter(ci => map.has(ci.productId))
			.map(ci => {
				const p = map.get(ci.productId)!;
				const unitPrice = Number(p.price);
				return { productId: ci.productId, quantity: ci.qty, unitPrice, name: p.name, slug: p.slug };
			});
		if (orderItemsData.length === 0) return new Response(JSON.stringify({ error: 'Sin items válidos' }), { status: 400 });
		const subtotal = orderItemsData.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
		const total = subtotal; // impuestos / envio futuros
		// Usuario autenticado (si existe cookie auth_user_id)
		const currentUser = await getCurrentUser();
		const userId = currentUser?.id;
		// @ts-ignore prisma types stale - delegate exists at runtime
		const order = await prisma.order.create({
			data: {
				customer: customer!,
				email: email!,
				address: address!,
				phone: phone!,
				subtotal,
				total,
				userId,
				items: { create: orderItemsData.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, name: i.name, slug: i.slug })) }
			},
			include: { items: true }
		});
		clearCart();
		return new Response(JSON.stringify(order), { status: 201, headers: { 'Content-Type': 'application/json' } });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: 'No se pudo crear orden', detalle: e.message }), { status: 500 });
	}
}
