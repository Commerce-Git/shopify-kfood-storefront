/**
 * Global Review Types (SSOT)
 */

export interface ReviewItem {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  photo_urls?: string[];
  submitted_at: string;
}

export type Review = ReviewItem;
