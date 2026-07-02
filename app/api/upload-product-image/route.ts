import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

function getUploadDir(): string {
  return (
    process.env.PRODUCT_UPLOAD_DIR ||
    path.join(process.cwd(), 'public', 'uploads', 'products')
  );
}

function buildPublicUrl(fileName: string): string {
  return `/uploads/products/${fileName}`;
}

function sanitizeExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_EXTENSIONS.has(extension) ? extension : 'jpg';
}

function buildFileName(originalName: string): string {
  const extension = sanitizeExtension(originalName);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

function resolveContentType(fileName: string, provided?: string): string {
  if (provided && provided.startsWith('image/')) {
    return provided;
  }

  const extension = sanitizeExtension(fileName);
  return MIME_BY_EXTENSION[extension] || 'image/jpeg';
}

function decodeFileName(headerValue: string | null): string {
  if (!headerValue) return 'image.jpg';

  try {
    return decodeURIComponent(headerValue);
  } catch {
    return headerValue;
  }
}

async function saveImageBuffer(buffer: Buffer, originalName: string, contentType: string) {
  if (!contentType.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Выберите файл изображения (JPG, PNG, WEBP)' },
      { status: 400 }
    );
  }

  if (buffer.length === 0) {
    return NextResponse.json({ error: 'Файл пустой' }, { status: 400 });
  }

  if (buffer.length > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Фото не больше 5 МБ' }, { status: 400 });
  }

  const fileName = buildFileName(originalName);
  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: buildPublicUrl(fileName) });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const requestType = request.headers.get('content-type') || '';

    if (requestType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
      }

      const blob = file as Blob;
      const uploadFileName =
        'name' in file && typeof file.name === 'string' ? file.name : 'image.jpg';
      const contentType = resolveContentType(uploadFileName, blob.type);
      const buffer = Buffer.from(await blob.arrayBuffer());

      return saveImageBuffer(buffer, uploadFileName, contentType);
    }

    const uploadFileName = decodeFileName(request.headers.get('x-file-name'));
    const contentType = resolveContentType(uploadFileName, requestType.split(';')[0]?.trim());
    const buffer = Buffer.from(await request.arrayBuffer());

    return saveImageBuffer(buffer, uploadFileName, contentType);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить фото. Проверьте интернет и попробуйте снова.',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
