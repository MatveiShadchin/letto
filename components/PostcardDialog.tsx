'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CartItemExtras } from '@/types/product';

interface PostcardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (extras: CartItemExtras) => void;
  baseExtras: Omit<CartItemExtras, 'postcardWanted' | 'postcardText'>;
}

export function PostcardDialog({
  open,
  onOpenChange,
  onConfirm,
  baseExtras,
}: PostcardDialogProps) {
  const [wantsPostcard, setWantsPostcard] = useState<boolean | null>(null);
  const [postcardText, setPostcardText] = useState('');

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setWantsPostcard(null);
      setPostcardText('');
    }
    onOpenChange(nextOpen);
  };

  const finish = (wanted: boolean) => {
    onConfirm({
      ...baseExtras,
      postcardWanted: wanted,
      postcardText: wanted ? postcardText.trim() : '',
    });
    setWantsPostcard(null);
    setPostcardText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl border-[#F3F2F1]">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A]">Бесплатная открытка</DialogTitle>
          <DialogDescription className="text-[#1A1A1A]/65">
            Добавим открытку к букету — напишем ваш текст от руки
          </DialogDescription>
        </DialogHeader>

        {wantsPostcard === null ? (
          <div className="flex gap-3 py-2">
            <Button
              type="button"
              variant="brand"
              className="flex-1 rounded-xl"
              onClick={() => setWantsPostcard(true)}
            >
              Да, хочу
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-[#E8E4E0]"
              onClick={() => finish(false)}
            >
              Нет, спасибо
            </Button>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <label htmlFor="postcard-text" className="text-sm font-medium text-[#1A1A1A]">
              Текст на открытке *
            </label>
            <Textarea
              id="postcard-text"
              value={postcardText}
              onChange={(e) => setPostcardText(e.target.value)}
              placeholder="Например: С днём рождения, любимая!"
              className="min-h-[100px] rounded-xl border-[#E8E4E0] focus-visible:ring-[#5E4037]"
              autoFocus
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setWantsPostcard(null)}
              >
                Назад
              </Button>
              <Button
                type="button"
                variant="brand"
                className="rounded-xl"
                disabled={!postcardText.trim()}
                onClick={() => finish(true)}
              >
                Добавить в корзину
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
