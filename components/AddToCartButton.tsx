'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  inCartLabel?: string;
  variant?: 'brand' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  iconClassName?: string;
};

export function AddToCartButton({
  product,
  extras = DEFAULT_CART_EXTRAS,
  label = 'В корзину',
  inCartLabel = 'В корзине',
  variant = 'brand',
  size = 'default',
  className,
  iconClassName,
}: AddToCartButtonProps) {
  const { state, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  const quantityInCart = useMemo(
    () =>
      state.items
        .filter((item) => item.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0),
    [state.items, product.id]
  );

  const inCart = quantityInCart > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    addToCart(product, extras);
    setJustAdded(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setJustAdded(false), 500);
  };

  const showInCart = inCart || justAdded;
  const displayLabel =
    justAdded && !inCart
      ? inCartLabel
      : inCart
        ? quantityInCart > 1
          ? `${inCartLabel} · ${quantityInCart}`
          : inCartLabel
        : label;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-live="polite"
      aria-label={showInCart ? `${inCartLabel}, добавить ещё` : label}
      className={cn(
        'add-to-cart-btn transition-[transform,background-color,color] duration-150',
        justAdded && 'add-to-cart-btn--added',
        showInCart &&
          variant === 'brand' &&
          'bg-[#3D3D3D] hover:bg-[#2D2D2D] hover:text-white',
        className
      )}
    >
      {showInCart ? (
        <Check className={cn('shrink-0', iconClassName || 'w-4 h-4 mr-1.5')} strokeWidth={2.5} />
      ) : (
        <ShoppingCart className={cn('shrink-0', iconClassName || 'w-4 h-4 mr-1.5')} />
      )}
      {displayLabel}
    </Button>
  );
}
