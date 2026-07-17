'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Phone, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { HEADER_PHONE, VK_URL } from '@/lib/store-locations';
import { cn } from '@/lib/utils';

function VkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.657 4 8.18c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.609 2.18-3.609.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
  );
}

export function Header() {
  const { state, addPulse } = useCart();
  const [pulse, setPulse] = useState(false);
  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'Отзывы', href: '/reviews' },
    { name: 'Контакты', href: '/contacts' },
  ];

  useEffect(() => {
    if (addPulse === 0) return;
    setPulse(false);
    const frame = requestAnimationFrame(() => setPulse(true));
    const timer = window.setTimeout(() => setPulse(false), 340);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [addPulse]);

  return (
    <header className="bg-[#2D2D2D] text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
            <Image
              src="/letto-logo.png"
              alt="Летто — цветы"
              width={104}
              height={88}
              className="h-9 md:h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-[#F9F5F0] transition-colors antialiased tracking-tight text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4 md:space-x-5">
            <a
              href={VK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Мы ВКонтакте"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#5E4037] p-2 md:pl-2 md:pr-3 md:py-1.5 text-sm font-semibold text-white hover:bg-[#4A3329] transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <VkIcon className="h-4 w-4" />
              </span>
              <span className="hidden md:inline">VK</span>
            </a>

            <a
              href={HEADER_PHONE.href}
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#F9F5F0] transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              {HEADER_PHONE.label}
            </a>

            <Link href="/cart" className="relative" aria-label="Корзина">
              <ShoppingCart
                className={cn('h-6 w-6 text-white', pulse && 'cart-icon-pulse')}
              />
              {state.itemCount > 0 && (
                <span
                  key={`${state.itemCount}-${addPulse}`}
                  className={cn(
                    'absolute -top-2 -right-2 bg-[#5E4037] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center antialiased',
                    pulse && 'cart-badge-pulse'
                  )}
                >
                  {state.itemCount}
                </span>
              )}
            </Link>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-[#3D3D3D]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#2D2D2D] text-white">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg hover:text-[#F9F5F0] transition-colors antialiased tracking-tight text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex flex-col gap-3 pt-4 border-t border-[#3D3D3D]">
                    <a
                      href={VK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#5E4037] pl-2 pr-4 py-2 text-sm font-semibold text-white hover:bg-[#4A3329] transition-colors w-fit"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                        <VkIcon className="h-4 w-4" />
                      </span>
                      ВКонтакте
                    </a>
                    <a
                      href={HEADER_PHONE.href}
                      className="flex items-center gap-2 text-white hover:text-[#F9F5F0]"
                    >
                      <Phone className="h-4 w-4" />
                      {HEADER_PHONE.label}
                    </a>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
