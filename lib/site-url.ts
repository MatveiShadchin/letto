const DEFAULT_DOMAIN = 'toastbetter.ru';

export function getSiteDomain(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    `https://${DEFAULT_DOMAIN}`;
  try {
    return new URL(fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`).hostname;
  } catch {
    return DEFAULT_DOMAIN;
  }
}

export function getPublicSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return `https://${DEFAULT_DOMAIN}`;
}
