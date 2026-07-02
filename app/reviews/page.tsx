import { ReviewsContent } from '@/components/ReviewsContent';
import { getReviews } from '@/lib/reviews-server';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewsContent reviews={reviews} />;
}
