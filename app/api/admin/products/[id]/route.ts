import { NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/prisma';
import { requirePermission } from '../../../../../src/lib/permissions';
import { FALLBACK_IMAGE, saveUploadedFile, slugify, deleteIfLocal } from '../../../../../src/lib/uploads';
import { logAudit } from '../../../../../src/lib/audit';

export const runtime = 'nodejs';

function err(status: number, code: string, message?: string) { return NextResponse.json({ error: message || code, code }, { status }); }

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
	try {
		await requirePermission('product:read');
		const product = await prisma.product.findUnique({ where: { id: params.id } });
		if (!product) return err(404,'NOT_FOUND');
		return NextResponse.json(product);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR');
	}
}

export async function PUT(req: Request, { params }: Params) {
	try {
		await requirePermission('product:update');
		const contentType = req.headers.get('content-type') || '';
		let name = '';
		let price: any;
		let description: any = null;
		let categoryId = '';
		let active: any = true;
		let imageUrl: string | null | undefined = undefined; // undefined keep, null remove, string set
		let file: File | null = null;

		if (contentType.includes('multipart/form-data')) {
			const form = await req.formData();
			name = String(form.get('name') || '').trim();
			price = form.get('price');
			description = (form.get('description') || '').toString().trim() || null;
			categoryId = String(form.get('categoryId') || '');
			active = String(form.get('active') || 'true') === 'true';
			const removeFlag = form.get('removeImage');
			if (removeFlag === 'true') imageUrl = null;
			const f = form.get('image');
			if (f instanceof File && f.size > 0) file = f;
		} else {
			const body = await req.json();
			name = (body.name||'').trim();
			price = body.price;
			description = body.description || null;
			categoryId = body.categoryId;
			active = body.active ?? true;
			imageUrl = body.imageUrl; // could be undefined/null/string
		}

		if (!name || !price || !categoryId) return err(400,'MISSING_FIELDS');
		const numericPrice = Number(price);
		if (Number.isNaN(numericPrice)) return err(400,'INVALID_PRICE');
		const slug = slugify(name);

		const existing = await prisma.product.findUnique({ where: { id: params.id }, select: { imageUrl: true } });
		if (!existing) return err(404,'NOT_FOUND');

		let finalImage = existing.imageUrl || FALLBACK_IMAGE;
		let oldImageToDelete: string | null = null;

		if (file) {
			try {
				const saved = await saveUploadedFile(file,'items', slug);
				if (existing.imageUrl && existing.imageUrl !== FALLBACK_IMAGE) oldImageToDelete = existing.imageUrl;
				finalImage = saved.relativePath;
			} catch (uploadErr: any) {
				if (uploadErr instanceof Error) {
					if (uploadErr.message === 'FILE_TOO_LARGE') return err(400,'FILE_TOO_LARGE');
					if (uploadErr.message === 'INVALID_MIME') return err(400,'INVALID_MIME');
					if (uploadErr.message === 'INVALID_EXT') return err(400,'INVALID_EXT');
				}
				return err(500,'UPLOAD_FAILED');
			}
		} else if (imageUrl === null) {
			if (existing.imageUrl && existing.imageUrl !== FALLBACK_IMAGE) oldImageToDelete = existing.imageUrl;
			finalImage = FALLBACK_IMAGE;
		}
		// if imageUrl undefined -> keep existing, if string provided (not handled separately) future branch could set explicit URL

		const product = await prisma.product.update({ where: { id: params.id }, data: { name, slug, price: numericPrice, description, categoryId, active, imageUrl: finalImage } });
		logAudit('product.update','Product', product.id, { name });
		if (oldImageToDelete) deleteIfLocal(oldImageToDelete);
		return NextResponse.json(product);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error updating');
	}
}

export async function DELETE(_: Request, { params }: Params) {
	try {
		await requirePermission('product:delete');
		const existing = await prisma.product.findUnique({ where: { id: params.id }, select: { imageUrl: true } });
		if (!existing) return err(404,'NOT_FOUND');
		await prisma.product.delete({ where: { id: params.id } });
		logAudit('product.delete','Product', params.id);
		if (existing.imageUrl && existing.imageUrl !== FALLBACK_IMAGE) deleteIfLocal(existing.imageUrl);
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error deleting');
	}
}
