// src/components/products/ReviewSection.tsx
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import StarRating from '../common/StarRating';
import ReviewModal from './ReviewModal';
import { ReviewResponse, Review, ReviewStats } from '../../types/review.types';

interface ReviewSectionProps {
  productId: number;
  productName: string;
  initialRating: number;
  initialReviewCount: number;
  onReviewAdded?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  productName,
  initialRating,
  initialReviewCount,
  onReviewAdded,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'newest' | 'oldest'>('highest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products/reviews.php', {
        product_id: productId,
        page: page,
        limit: 5,
        sort: sortBy,
        rating: ratingFilter || undefined
      });
      
      if (response.success && response.data) {
        const data = response.data as ReviewResponse;
        setStats(data.stats);
        setReviews(data.reviews);
        setTotalPages(data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy, ratingFilter]);

  const toggleReviewExpand = (reviewId: number) => {
    const newSet = new Set(expandedReviews);
    if (newSet.has(reviewId)) {
      newSet.delete(reviewId);
    } else {
      newSet.add(reviewId);
    }
    setExpandedReviews(newSet);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const renderRatingBars = () => {
    if (!stats || stats.total_reviews === 0) return null;
    
    const maxCount = Math.max(...Object.values(stats.distribution));
    
    return [5, 4, 3, 2, 1].map((star) => {
      const count = stats.distribution[star as keyof typeof stats.distribution] || 0;
      const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
      
      return (
        <button
          key={star}
          onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
          className={`flex items-center gap-2 w-full hover:bg-gray-50 rounded p-1 transition ${
            ratingFilter === star ? 'bg-royal-blue/5' : ''
          }`}
        >
          <span className="text-sm font-medium w-8">{star} ★</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-royal-blue rounded-full transition-all duration-300"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
        </button>
      );
    });
  };

  return (
    <div className="mt-8">
      {/* Review Modal */}
      <ReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={() => {
          fetchReviews();
          if (onReviewAdded) onReviewAdded();
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Customer Reviews
          {stats && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({stats.total_reviews} reviews)
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-royal-blue text-white rounded-lg font-medium hover:bg-royal-blue-dark transition"
        >
          Write a Review
        </button>
      </div>

      {/* Stats Summary */}
      {stats && stats.total_reviews > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-gray-800">{stats.average_rating}</div>
            <div className="flex justify-center md:justify-start">
              <StarRating rating={stats.average_rating} size="lg" />
            </div>
            <div className="text-sm text-gray-500 mt-1">{stats.total_reviews} reviews</div>
          </div>
          <div className="md:col-span-2">
            <div className="space-y-1 max-w-sm mx-auto md:mx-0">
              {renderRatingBars()}
            </div>
            {stats.percentage_verified > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <CheckCircle className="w-4 h-4" />
                {stats.percentage_verified}% of reviews are from verified purchases
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Sort and Filter */}
      {stats && stats.total_reviews > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'highest', label: 'Highest Rated' },
              { value: 'lowest', label: 'Lowest Rated' },
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as any)}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  sortBy === option.value
                    ? 'bg-royal-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {ratingFilter && (
            <button
              onClick={() => setRatingFilter(null)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
            >
              Clear Filter ✕
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const isLongReview = review.review.length > 200;
            
            return (
              <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-royal-blue/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-royal-blue font-semibold">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-medium text-gray-800">
                          {review.customer_name}
                          {review.verified_purchase && (
                            <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-500">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h4 className="font-medium text-gray-800 mt-2">{review.title}</h4>
                    )}
                    
                    <p className="text-gray-600 text-sm mt-1">
                      {isLongReview && !isExpanded
                        ? `${review.review.slice(0, 200)}...`
                        : review.review
                      }
                      {isLongReview && (
                        <button
                          onClick={() => toggleReviewExpand(review.id)}
                          className="text-royal-blue text-sm font-medium ml-1 hover:underline"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;