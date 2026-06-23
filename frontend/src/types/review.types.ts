// src/types/review.types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface Review {
  id: number;
  product_id: number;
  customer_id: number;
  rating: number;
  title: string | null;
  review: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  verified_count: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentage_verified: number;
}

export interface ReviewResponse {
  stats: ReviewStats;
  reviews: Review[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface CanReviewResponse {
  customer_id: number;
  order_id: number;
  order_number: string;
}

export interface CanReviewData {
  success: boolean;
  message: string;
  data: CanReviewResponse | null;
}

// Admin Review Types
export interface PendingReview {
  id: number;
  rating: number;
  title: string | null;
  review: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  product_name: string;
  product_id: number;
  product_slug: string;
}

export interface PendingReviewsResponse {
  reviews: PendingReview[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminReviewStats {
  total: number;
  approved: number;
  pending: number;
}