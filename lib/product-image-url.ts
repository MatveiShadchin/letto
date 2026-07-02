const OBJECT_PREFIX = '/storage/v1/object/public/';
const RENDER_PREFIX = '/storage/v1/render/image/public/';

export function getProductImageUrl(
  url: string | undefined | null,
  width = 400,
  height = 400,
  quality = 75
): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (!parsed.hostname.endsWith('.supabase.co')) {
      return url;
    }

    if (parsed.pathname.includes(OBJECT_PREFIX)) {
      parsed.pathname = parsed.pathname.replace(OBJECT_PREFIX, RENDER_PREFIX);
    } else if (!parsed.pathname.includes(RENDER_PREFIX)) {
      return url;
    }

    parsed.searchParams.set('width', String(width));
    parsed.searchParams.set('height', String(height));
    parsed.searchParams.set('resize', 'cover');
    parsed.searchParams.set('quality', String(quality));

    return parsed.toString();
  } catch {
    return url;
  }
}

export function getOriginalProductImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.pathname.includes(RENDER_PREFIX)) {
      parsed.pathname = parsed.pathname.replace(RENDER_PREFIX, OBJECT_PREFIX);
      parsed.search = '';
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
