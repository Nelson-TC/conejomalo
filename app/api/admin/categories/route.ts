import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { requirePermission } from '../../../../src/lib/permissions';
import { FALLBACK_IMAGE, saveUploadedFile, slugify } from '../../../../src/lib/uploads';
import { logAudit } from '../../../../src/lib/audit';

export const runtime = 'nodejs';

function err(status: number, code: string, message?: string) {
  return NextResponse.json({ error: message || code, code }, { status });
}

export async function GET() {
	try {
		await requirePermission('category:read');
		const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
		return NextResponse.json(categories);
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error fetching categories');
	}
}

export async function POST(req: Request) {
	try {
		await requirePermission('category:create');
		const contentType = req.headers.get('content-type') || '';
		let name = '';
		let active: any = true;
		let file: File | null = null;
		let imageUrl: string | null = null;

		if (contentType.includes('multipart/form-data')) {
			const form = await req.formData();
			name = String(form.get('name') || '').trim();
			active = String(form.get('active') || 'true') === 'true';
			const f = form.get('image');
			if (f instanceof File && f.size > 0) file = f;
		} else {
			const body = await req.json();
			name = (body.name||'').trim();
			active = body.active ?? true;
		}
		if (!name) return err(400,'NAME_REQUIRED','Name required');
		const slug = slugify(name);

		if (file) {
			try {
				const saved = await saveUploadedFile(file,'media/categories', slug);
				imageUrl = saved.relativePath;
			} catch (uploadErr: any) {
				if (uploadErr instanceof Error) {
					if (uploadErr.message === 'FILE_TOO_LARGE') return err(400,'FILE_TOO_LARGE');
					if (uploadErr.message === 'INVALID_MIME') return err(400,'INVALID_MIME');
					if (uploadErr.message === 'INVALID_EXT') return err(400,'INVALID_EXT');
				}
				return err(500,'UPLOAD_FAILED');
			}
		} else {
			imageUrl = FALLBACK_IMAGE;
		}

		const category = await prisma.category.create({ data: { name, slug, active, imageUrl } });
		logAudit('category.create','Category', category.id, { name });
		return NextResponse.json(category, { status: 201 });
	} catch (e: any) {
		if (e instanceof Error) {
			if (e.message === 'UNAUTHENTICATED') return err(401,'UNAUTHENTICATED');
			if (e.message === 'FORBIDDEN') return err(403,'FORBIDDEN');
		}
		return err(500,'SERVER_ERROR','Error creating category');
	}
}
