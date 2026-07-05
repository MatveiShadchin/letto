'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { ProductsGrid } from '@/components/ProductsGrid';
import { categories, priceRanges } from '@/data/products';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { sortByPopularity } from '@/lib/product-popularity';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Популярное' },
  { value: 'price-asc', label: 'Дешевле' },
  { value: 'price-desc', label: 'Дороже' },
] as const;

export function CatalogPageClient({
  initialProducts,
  initialCategory,
}: {
  initialProducts: Product[];
  initialCategory?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    let cancelled = false;

    fetch('/api/products')
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => {
        if (!cancelled && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    selectedCategories.length +
    (selectedPriceRange !== 'all' ? 1 : 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, selectedPriceRange, sortBy]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const getRubles = (price: number) => price / 100;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category));
    }

    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter((product) => {
        const price = getRubles(product.price);
        if (selectedPriceRange === '0-1000') return price <= 1000;
        if (selectedPriceRange === '1000-3000') return price > 1000 && price <= 3000;
        if (selectedPriceRange === '3000-5000') return price > 3000 && price <= 5000;
        if (selectedPriceRange === '5000+') return price > 5000;
        return true;
      });
    }

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => getRubles(a.price) - getRubles(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => getRubles(b.price) - getRubles(a.price));
        break;
      default:
        filtered = sortByPopularity(filtered);
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategories, selectedPriceRange, sortBy, products]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedPriceRange('all');
    setSortBy('popular');
  };

  const getCategoryCount = (category: string) =>
    products.filter((product) => product.category === category).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">Каталог товаров</h1>
          <p className="text-[#1A1A1A]/70">Найдите идеальный букет для любого случая</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFiltersOpen((open) => !open)}
              className={cn(
                'h-9 rounded-full border-[#E8E4E0] bg-white px-4 text-sm shadow-sm hover:bg-[#F5F3F0]',
                filtersOpen && 'border-[#5E4037] bg-[#5E4037] text-white hover:bg-[#4A3329] hover:text-white'
              )}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Фильтр
              {activeFiltersCount > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    'h-8 rounded-full px-3 text-xs font-medium transition-colors',
                    sortBy === option.value
                      ? 'bg-[#5E4037] text-white shadow-sm'
                      : 'bg-white text-[#1A1A1A]/80 border border-[#E8E4E0] hover:bg-[#F5F3F0]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-[#1A1A1A]/60">
            Найдено <span className="font-semibold text-[#1A1A1A]">{filteredProducts.length}</span>{' '}
            товаров
          </p>
        </div>

        {filtersOpen && (
          <div className="mb-8 rounded-2xl border border-[#E8E4E0] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Настройки фильтра</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 text-[#1A1A1A]/50 hover:bg-[#F5F3F0] hover:text-[#1A1A1A]"
                aria-label="Закрыть фильтр"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm text-[#1A1A1A]/70">
                  Поиск
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/40" />
                  <Input
                    id="search"
                    placeholder="Название или описание..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-xl border-[#E8E4E0] bg-[#FAFAF9] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#1A1A1A]/70">Категории</p>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((category) => {
                    const active = selectedCategories.includes(category.value);
                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => handleCategoryChange(category.value)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          active
                            ? 'border-[#5E4037] bg-[#5E4037] text-white'
                            : 'border-[#E8E4E0] bg-[#FAFAF9] text-[#1A1A1A]/80 hover:border-[#5E4037]/30'
                        )}
                      >
                        {category.label} ({getCategoryCount(category.value)})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#1A1A1A]/70">Цена</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPriceRange('all')}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      selectedPriceRange === 'all'
                        ? 'border-[#5E4037] bg-[#5E4037] text-white'
                        : 'border-[#E8E4E0] bg-[#FAFAF9] text-[#1A1A1A]/80 hover:border-[#5E4037]/30'
                    )}
                  >
                    Все цены
                  </button>
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() =>
                        setSelectedPriceRange(
                          selectedPriceRange === range.value ? 'all' : range.value
                        )
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        selectedPriceRange === range.value
                          ? 'border-[#5E4037] bg-[#5E4037] text-white'
                          : 'border-[#E8E4E0] bg-[#FAFAF9] text-[#1A1A1A]/80 hover:border-[#5E4037]/30'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-[#F3F2F1] pt-5">
              <Button
                type="button"
                onClick={resetFilters}
                variant="outline"
                className="rounded-full border-[#E8E4E0] px-5"
              >
                Сбросить
              </Button>
              <Button
                type="button"
                onClick={() => setFiltersOpen(false)}
                variant="brand"
                className="rounded-full px-5"
              >
                Показать {filteredProducts.length} товаров
              </Button>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E4E0] bg-white py-16 text-center">
            <p className="text-lg text-[#1A1A1A]/70">
              {products.length === 0
                ? 'Каталог пока пуст'
                : selectedPriceRange !== 'all'
                  ? 'Нет товаров в этом диапазоне цен'
                  : 'По вашему запросу ничего не найдено'}
            </p>
            <p className="mt-2 text-sm text-[#1A1A1A]/40">
              {products.length === 0
                ? 'Товары не загружены в базу'
                : 'Измените фильтр или сбросьте параметры'}
            </p>
            {products.length > 0 && (
              <Button onClick={resetFilters} variant="brand" className="mt-4 rounded-full">
                Сбросить фильтры
              </Button>
            )}
          </div>
        ) : (
          <>
            <ProductsGrid products={paginatedProducts} />

            {filteredProducts.length > ITEMS_PER_PAGE && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="h-9 w-9 rounded-full p-0"
                    aria-label="Предыдущая страница"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-[#1A1A1A]/50">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page as number)}
                          variant={currentPage === page ? 'brand' : 'outline'}
                          className={cn(
                            'h-9 min-w-9 rounded-full px-3',
                            currentPage !== page && 'border-[#E8E4E0]'
                          )}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="h-9 w-9 rounded-full p-0"
                    aria-label="Следующая страница"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-[#1A1A1A]/60">
                  Страница {currentPage} из {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
