import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requirePermission } from '../../../../src/lib/permissions';
import { FALLBACK_IMAGE, saveUploadedFile, slugify } from '../../../../src/lib/uploads';
import { logAudit } from '../../../../src/lib/audit';

export const runtime = 'nodejs';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

export async function GET(req: Request) {
	try {
		await requirePermission('product:read');
		const { searchParams } = new URL(req.url);
		const pageParam = searchParams.get('page');
		const perParam = searchParams.get('per');
		const sortParam = (searchParams.get('sort') || 'new').trim();
		const q = (searchParams.get('q') || '').trim();
		const cat = (searchParams.get('cat') || '').trim(); // category id or slug
		const activeParam = searchParams.get('active'); // 'true' | 'false' | 'all'

		const hasParams = Boolean(pageParam || perParam || sortParam || q || cat || activeParam);

		const where: any = {};
		if (activeParam && activeParam !== 'all') where.active = activeParam === 'true';
		if (q) {
			where.AND = (where.AND || []).concat([
				{ OR: [
					{ name: { contains: q, mode: 'insensitive' } },
					{ description: { contains: q, mode: 'insensitive' } }
				]}
			]);
		}
		if (cat) {
			where.AND = (where.AND || []).concat([
				{ OR: [ { categoryId: cat }, { category: { slug: cat } } ] }
			]);
		}

		let orderBy: any = { createdAt: 'desc' };
		switch (sortParam) {
			case 'price_asc': orderBy = { price: 'asc' }; break;
			case 'price_desc': orderBy = { price: 'desc' }; break;
			case 'name': orderBy = { name: 'asc' }; break;
			case 'new': default: orderBy = { createdAt: 'desc' };
		}

		if (!hasParams) {
			const products = await prisma.product.findMany({ include: { category: true }, orderBy });
			return NextResponse.json(products);
		}

		const page = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
		const perRaw = Math.max(parseInt(perParam || '20', 10) || 20, 1);
		const per = Math.min(perRaw, 100);
		const skip = (page - 1) * per;

		const [total, items] = await Promise.all([
			prisma.product.count({ where }),
			prisma.product.findMany({ where, skip, take: per, orderBy, include: { category: true } })
		]);
		const totalPages = Math.max(Math.ceil(total / per), 1);
		return NextResponse.json({ items, page, per, total, totalPages });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error fetching products');
	}
}

export async function POST(req: Request) {
	try {
		await requirePermission('product:create');
		const contentType = req.headers.get('content-type') || '';
		let name = '';
		let price: any;
		let description: any = null;
		let categoryId = '';
		let active: any = true;
		let imageUrl: string | null = null;
		let file: File | null = null;

		if (contentType.includes('multipart/form-data')) {
			const form = await req.formData();
			name = String(form.get('name') || '').trim();
			price = form.get('price');
			description = (form.get('description') || '').toString().trim() || null;
			categoryId = String(form.get('categoryId') || '');
			active = String(form.get('active') || 'true') === 'true';
			const f = form.get('image');
			if (f instanceof File && f.size > 0) file = f;
		} else {
			const body = await req.json();
			name = (body.name||'').trim();
			price = body.price;
			description = body.description || null;
			categoryId = body.categoryId;
			active = body.active ?? true;
		}

		if (!name || !price || !categoryId) return err(400,'MISSING_FIELDS','Missing fields');
		const numericPrice = Number(price);
		if (Number.isNaN(numericPrice)) return err(400,'INVALID_PRICE','Invalid price');
	const slug = slugify(name);

		if (file) {
			try {
				const saved = await saveUploadedFile(file,'items', slug);
				imageUrl = saved.relativePath;
			} catch (uploadErr: any) {
				if (uploadErr instanceof Error) {
					if (uploadErr.message === 'FILE_TOO_LARGE') return err(400,'FILE_TOO_LARGE');
					if (uploadErr.message === 'INVALID_MIME') return err(400,'INVALID_MIME');
					if (uploadErr.message === 'INVALID_EXT') return err(400,'INVALID_EXT');
				}
				return err(500,'UPLOAD_FAILED');
			}
		}
		if (!imageUrl) imageUrl = FALLBACK_IMAGE;

		const product = await prisma.product.create({ data: { name, slug, price: numericPrice, description, categoryId, imageUrl, active } });
		logAudit('product.create','Product', product.id, { name });
		return NextResponse.json(product, { status: 201 });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error creating product');
	}
}
