import { cache } from 'react';
import { hasDatabase, query } from '@/lib/db';
import { FALLBACK_REVIEWS } from '@/lib/reviews-fallback';
import { Review } from '@/types/review';

function mapReviewRow(row: Review): Review {
  return {
    ...row,
    rating: Number(row.rating),
    review_date:
      typeof row.review_date === 'string'
        ? row.review_date
        : String(row.review_date).slice(0, 10),
  };
}

export const getReviews = cache(async (): Promise<Review[]> => {
  if (!hasDatabase()) {
    return FALLBACK_REVIEWS;
  }

  try {
    const { rows } = await query<Review>(
      `SELECT id, author, rating, review_date::text, text, bouquet, company_response, accent, sort_order, created_at
       FROM reviews
       WHERE is_published = true
       ORDER BY sort_order ASC, review_date DESC`
    );
    return rows.map(mapReviewRow);
  } catch (error) {
    console.error('getReviews:', error);
    return FALLBACK_REVIEWS;
  }
});
