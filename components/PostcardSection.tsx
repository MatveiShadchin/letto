'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { OrderPostcard } from '@/types/product';

interface PostcardSectionProps {
  value: OrderPostcard | null;
  onChange: (postcard: OrderPostcard) => void;
  className?: string;
}

export function PostcardSection({ value, onChange, className }: PostcardSectionProps) {
  const [wantsPostcard, setWantsPostcard] = useState<boolean | null>(
    value === null ? null : value.wanted
  );
  const [postcardText, setPostcardText] = useState(value?.text ?? '');

  useEffect(() => {
    if (value === null) return;
    setWantsPostcard(value.wanted);
    setPostcardText(value.text);
  }, [value]);

  const selectNo = () => {
    setWantsPostcard(false);
    setPostcardText('');
    onChange({ wanted: false, text: '' });
  };

  const selectYes = () => {
    setWantsPostcard(true);
    onChange({ wanted: true, text: postcardText.trim() });
  };

  const updateText = (text: string) => {
    setPostcardText(text);
    if (wantsPostcard) {
      onChange({ wanted: true, text: text.trim() });
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-[#E8E4E0] bg-[#F9F5F0] p-4 sm:p-5',
        className
      )}
    >
      <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Бесплатная открытка</h3>
      <p className="text-sm text-[#1A1A1A]/70 mb-4">
        Добавим открытку к букету — напишем ваш текст от руки
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant={wantsPostcard === true ? 'brand' : 'outline'}
          className={cn(
            'flex-1 rounded-xl',
            wantsPostcard !== true && 'border-[#E8E4E0] bg-white text-[#1A1A1A] hover:bg-white'
          )}
          onClick={selectYes}
        >
          Да, хочу
        </Button>
        <Button
          type="button"
          variant={wantsPostcard === false ? 'brand' : 'outline'}
          className={cn(
            'flex-1 rounded-xl',
            wantsPostcard !== false && 'border-[#E8E4E0] bg-white text-[#1A1A1A] hover:bg-white'
          )}
          onClick={selectNo}
        >
          Нет, спасибо
        </Button>
      </div>

      {wantsPostcard === true && (
        <div className="mt-4 space-y-2">
          <label htmlFor="postcard-text" className="text-sm font-medium text-[#1A1A1A]">
            Текст на открытке *
          </label>
          <Textarea
            id="postcard-text"
            value={postcardText}
            onChange={(e) => updateText(e.target.value)}
            placeholder="Например: С днём рождения, любимая!"
            className="min-h-[100px] rounded-xl border-[#E8E4E0] bg-white text-[#1A1A1A] focus-visible:ring-[#5E4037]"
          />
        </div>
      )}
    </div>
  );
}

export function isPostcardValid(postcard: OrderPostcard | null): boolean {
  if (postcard === null) return false;
  if (!postcard.wanted) return true;
  return postcard.text.trim().length > 0;
}
