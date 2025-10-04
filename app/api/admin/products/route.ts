import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requirePermission } from '../../../../src/lib/permissions';
import { FALLBACK_IMAGE, saveUploadedFile, slugify } from '../../../../src/lib/uploads';
import { logAudit } from '../../../../src/lib/audit';

export const runtime = 'nodejs';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

export async function GET() {
	try {
		await requirePermission('product:read');
		const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
		return NextResponse.json(products);
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
