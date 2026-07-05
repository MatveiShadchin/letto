'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADDON_OPTIONS } from '@/lib/cart-extras';
import { CartAddons } from '@/types/product';
import { cn } from '@/lib/utils';

export function AddToCartExtras({
  addons,
  onChange,
  className,
}: {
  addons: CartAddons;
  onChange: (addons: CartAddons) => void;
  className?: string;
}) {
  const setAddon = (key: keyof CartAddons, value: number) => {
    onChange({ ...addons, [key]: Math.max(0, value) });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-medium text-[#1A1A1A]/60 tracking-tight">
        Дополнительно к букету
      </p>
      <div className="space-y-1.5">
        {ADDON_OPTIONS.map((opt) => (
          <div
            key={opt.key}
            className="flex items-center justify-between rounded-lg bg-[#FAFAF9] border border-[#F3F2F1] px-3 py-2"
          >
            <span className="text-sm text-[#1A1A1A]/85">
              <span className="mr-1.5" aria-hidden>
                {opt.emoji}
              </span>
              {opt.label}
            </span>
            <div className="flex items-center border border-[#E8E4E0] rounded-lg bg-white">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-l-lg rounded-r-none"
                onClick={() => setAddon(opt.key, addons[opt.key] - 1)}
                disabled={addons[opt.key] === 0}
                aria-label={`Меньше: ${opt.label}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-7 text-center text-sm tabular-nums text-[#1A1A1A]">
                {addons[opt.key]}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-r-lg rounded-l-none"
                onClick={() => setAddon(opt.key, addons[opt.key] + 1)}
                aria-label={`Больше: ${opt.label}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
