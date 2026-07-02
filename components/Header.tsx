'use client';

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
import { ORDER_PHONES } from '@/lib/store-locations';

export function Header() {
  const { state } = useCart();
  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Каталог', href: '/catalog' },
    { name: 'Отзывы', href: '/reviews' },
    { name: 'Контакты', href: '/contacts' },
  ];

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

          {/* Desktop Navigation */}
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

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Phone */}
            <div className="hidden md:flex flex-col items-end gap-0.5 text-sm">
              {ORDER_PHONES.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="flex items-center gap-1.5 font-medium text-white hover:text-[#F9F5F0] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone.label}
                </a>
              ))}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-white" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#5E4037] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center antialiased">
                  {state.itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
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
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#3D3D3D]">
                    {ORDER_PHONES.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        className="flex items-center gap-2 text-white hover:text-[#F9F5F0]"
                      >
                        <Phone className="h-4 w-4" />
                        {phone.label}
                      </a>
                    ))}
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
