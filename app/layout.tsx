import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteShell } from '@/components/SiteShell';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Летто - Цветочный магазин',
  description: 'Современный цветочный магазин с доставкой по городу',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL;
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const preconnectOrigin = storageOrigin || supabaseOrigin;

  return (
    <html lang="ru">
      <head>
        {preconnectOrigin ? (
          <>
            <link rel="preconnect" href={preconnectOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={preconnectOrigin} />
          </>
        ) : null}
      </head>
      <body className={inter.className}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
