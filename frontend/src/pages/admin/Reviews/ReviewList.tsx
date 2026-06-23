// src/pages/admin/Reviews/ReviewList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { PendingReview, AdminReviewStats, PendingReviewsResponse } from '../../../types/review.types';

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/reviews/pending.php?page=${page}&limit=10`);
      if (response.success && response.data) {
        const data = response.data as PendingReviewsResponse;
        setReviews(data.reviews);
        setTotalPages(data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showMessage('error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/reviews/stats.php');
      if (response.success && response.data) {
        setStats(response.data as AdminReviewStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleApprove = async (reviewId: number) => {
    setActionLoading(reviewId);
    try {
      const response = await apiClient.post('/admin/reviews/approve.php', {
        review_id: reviewId,
        action: 'approve'
      });
      if (response.success) {
        showMessage('success', 'Review approved successfully!');
        fetchReviews();
        fetchStats();
      } else {
        showMessage('error', response.message || 'Failed to approve review');
      }
    } catch (error) {
      showMessage('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to reject this review? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(reviewId);
    try {
      const response = await apiClient.post('/admin/reviews/approve.php', {
        review_id: reviewId,
        action: 'reject'
      });
      if (response.success) {
        showMessage('success', 'Review rejected and removed');
        fetchReviews();
        fetchStats();
      } else {
        showMessage('error', response.message || 'Failed to reject review');
      }
    } catch (error) {
      showMessage('error', 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 mt-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal-blue">Review Management</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or reject customer reviews</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-royal-blue/10 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-royal-blue" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-royal-blue mx-auto mb-4" />
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-2">No pending reviews to moderate.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {review.rating}.0/5
                    </span>
                    {review.title && (
                      <span className="text-sm text-gray-500">• {review.title}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{review.review}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Customer:</span>
                      {review.customer_name || 'Unknown'}
                      <span className="text-gray-400">({review.customer_phone})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Product:</span>
                      <Link 
                        to={`/products/product/${review.product_slug}`}
                        target="_blank"
                        className="text-royal-blue hover:underline"
                      >
                        {review.product_name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Submitted:</span>
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actionLoading === review.id}
                    className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={actionLoading === review.id}
                    className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <Link
                    to={`/products/product/${review.product_slug}`}
                    target="_blank"
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-1 justify-center"
                  >
                    <Eye className="w-4 h-4" />
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;