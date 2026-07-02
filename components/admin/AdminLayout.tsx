'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Box, Mail, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Dashboard } from './Dashboard';
import { Products } from './Products';
import { Inquiries } from './Inquiries';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'dashboard', label: 'Главная', shortLabel: 'Главная', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', shortLabel: 'Товары', icon: Box },
  { id: 'inquiries', label: 'Заявки и заказы', shortLabel: 'Заявки', icon: Mail },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AdminLayout({
  initialProducts,
  initialProductsError,
  onLogout,
}: {
  initialProducts: Product[];
  initialProductsError: string | null;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const activeLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? 'Админка';

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE', credentials: 'include' });
    onLogout();
    router.push('/');
  };

  const selectTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
  };

  const NavButtons = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              selectTab(tab.id);
              onNavigate?.();
            }}
            className={cn(
              'flex items-center w-full p-3 rounded-xl text-left transition-colors',
              activeTab === tab.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            )}
          >
            <Icon className="w-5 h-5 mr-3 shrink-0" />
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          handleLogout();
        }}
        className="flex items-center w-full p-3 rounded-xl hover:bg-gray-700 mt-4 border-t border-gray-700 pt-4"
      >
        <LogOut className="w-5 h-5 mr-3 shrink-0" />
        <span className="text-sm">Выйти</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 bg-gray-800 text-white flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Панель управления</h1>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavButtons />
        </nav>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 bg-gray-800 text-white px-4 py-3 border-b border-gray-700">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-700 shrink-0"
              aria-label="Открыть меню"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100vw-2rem,18rem)] bg-gray-800 text-white border-gray-700 p-0">
            <SheetHeader className="p-4 border-b border-gray-700 text-left">
              <SheetTitle className="text-white text-lg">Панель управления</SheetTitle>
            </SheetHeader>
            <nav className="p-4 space-y-2">
              <NavButtons onNavigate={() => setMenuOpen(false)} />
            </nav>
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold truncate flex-1 text-center">{activeLabel}</h1>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-700 shrink-0"
          onClick={handleLogout}
          aria-label="Выйти"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectTab(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 px-1 text-[10px] sm:text-xs transition-colors',
                  isActive ? 'text-[#5E4037] bg-[#F9F5F0]' : 'text-gray-500'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-tight text-center">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 min-w-0 overflow-auto pb-20 lg:pb-0">
        <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
          <Dashboard />
        </div>
        <div className={activeTab === 'products' ? '' : 'hidden'}>
          <Products
            initialProducts={initialProducts}
            initialError={initialProductsError}
          />
        </div>
        <div className={activeTab === 'inquiries' ? '' : 'hidden'}>
          <Inquiries />
        </div>
      </main>
    </div>
  );
}
