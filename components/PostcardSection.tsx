'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { OrderPostcard } from '@/types/product';

interface PostcardSectionProps {
  value: OrderPostcard | null;
  onChange: (postcard: OrderPostcard) => void;
  className?: string;
}

/** Опциональная открытка: если поле заполнено — будет открытка, иначе нет. */
export function PostcardSection({ value, onChange, className }: PostcardSectionProps) {
  const [postcardText, setPostcardText] = useState(value?.text ?? '');

  useEffect(() => {
    if (value === null) {
      setPostcardText('');
      return;
    }
    setPostcardText(value.text);
  }, [value]);

  const emit = (text: string) => {
    const trimmed = text.trim();
    onChange(
      trimmed
        ? { wanted: true, text: trimmed }
        : { wanted: false, text: '' }
    );
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
        Необязательно. Если напишете текст — добавим открытку к букету от руки
      </p>

      <div className="space-y-2">
        <label htmlFor="postcard-text" className="text-sm font-medium text-[#1A1A1A]">
          Текст на открытке
        </label>
        <Textarea
          id="postcard-text"
          value={postcardText}
          onChange={(e) => {
            setPostcardText(e.target.value);
            emit(e.target.value);
          }}
          onBlur={() => {
            const trimmed = postcardText.trim();
            setPostcardText(trimmed);
            emit(trimmed);
          }}
          placeholder="Например: С днём рождения, любимая!"
          className="min-h-[100px] rounded-xl border-[#E8E4E0] bg-white text-[#1A1A1A] focus-visible:ring-[#5E4037]"
        />
      </div>
    </div>
  );
}

/** Открытка опциональна — пустое поле допустимо. */
export function isPostcardValid(_postcard: OrderPostcard | null): boolean {
  return true;
}
