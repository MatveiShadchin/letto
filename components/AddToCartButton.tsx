'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { DEFAULT_CART_EXTRAS } from '@/lib/cart-extras';
import { cn } from '@/lib/utils';
import { CartItemExtras, Product } from '@/types/product';

type AddToCartButtonProps = {
  product: Product;
  extras?: CartItemExtras;
  label?: string;
  addedLabel?: string;
  variant?: 'brand' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  iconClassName?: string;
};

export function AddToCartButton({
  product,
  extras = DEFAULT_CART_EXTRAS,
  label = 'В корзину',
  addedLabel = 'Добавлено',
  variant = 'brand',
  size = 'default',
  className,
  iconClassName,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    addToCart(product, extras);
    setAdded(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAdded(false), 700);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-live="polite"
      className={cn(
        'add-to-cart-btn transition-[transform,background-color,color] duration-150',
        added && 'add-to-cart-btn--added pointer-events-none',
        className
      )}
    >
      {added ? (
        <Check className={cn('shrink-0', iconClassName || 'w-4 h-4 mr-1.5')} strokeWidth={2.5} />
      ) : (
        <ShoppingCart className={cn('shrink-0', iconClassName || 'w-4 h-4 mr-1.5')} />
      )}
      {added ? addedLabel : label}
    </Button>
  );
}
