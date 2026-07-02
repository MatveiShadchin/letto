'use client';

import { useEffect, useRef } from 'react';

interface AddressSuggestProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (address: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export function AddressSuggest({ value, onChange, onSuggestionSelect, placeholder }: AddressSuggestProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<any>(null);

  useEffect(() => {
    const loadYandexSuggest = () => {
      if (window.ymaps && window.ymaps.SuggestView) {
        initSuggest();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=2943d94b-ef48-4e84-8352-0c12a4af0c5d&lang=ru_RU&load=package.standard,package.suggest';
      script.onload = () => {
        window.ymaps.ready(initSuggest);
      };
      document.head.appendChild(script);
    };

    const initSuggest = () => {
      if (inputRef.current && !suggestRef.current) {
        suggestRef.current = new window.ymaps.SuggestView(inputRef.current, {
          results: 5,
          boundedBy: [[54.5, 59.5], [55.5, 61.0]] // Ограничение по области Миасса
        });

        suggestRef.current.events.add('select', (e: any) => {
          const selectedAddress = e.get('item').value;
          onSuggestionSelect(selectedAddress);
        });
      }
    };

    loadYandexSuggest();

    return () => {
      if (suggestRef.current) {
        suggestRef.current.destroy();
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Введите адрес..."}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
    />
  );
}
