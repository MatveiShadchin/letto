export interface Review {
  id: string;
  author: string;
  rating: number;
  review_date: string;
  text: string;
  bouquet?: string | null;
  company_response?: string | null;
  accent: string;
  sort_order: number;
  created_at?: string;
}
