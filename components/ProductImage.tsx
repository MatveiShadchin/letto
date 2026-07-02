'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/placeholders';
import {
  getOriginalProductImageUrl,
  getProductImageUrl,
} from '@/lib/product-image-url';

type ImageStage = 'optimized' | 'original' | 'fallback';

export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  size = 400,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  size?: number;
}) {
  const stages = useMemo(() => {
    const optimized = getProductImageUrl(src, size, size);
    const original = getOriginalProductImageUrl(src) || src || '';
    return {
      optimized: optimized || original || DEFAULT_PRODUCT_IMAGE,
      original: original || DEFAULT_PRODUCT_IMAGE,
      fallback: DEFAULT_PRODUCT_IMAGE,
    };
  }, [src, size]);

  const [stage, setStage] = useState<ImageStage>('optimized');
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setStage('optimized');
    setLoaded(false);
    setFailed(false);
  }, [src, size]);

  const currentSrc =
    stage === 'optimized'
      ? stages.optimized
      : stage === 'original'
        ? stages.original
        : stages.fallback;

  const handleError = () => {
    setLoaded(false);
    if (stage === 'optimized' && stages.original !== stages.optimized) {
      setStage('original');
      return;
    }
    if (stage !== 'fallback') {
      setStage('fallback');
      return;
    }
    setFailed(true);
  };

  return (
    <>
      {!loaded && !failed && (
        <div className="absolute inset-0 bg-[#F3F2F1] animate-pulse" />
      )}
      {!failed ? (
        <img
          src={currentSrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F3F2F1] text-[#5E4037] text-sm font-medium px-4 text-center">
          {alt}
        </div>
      )}
    </>
  );
}
