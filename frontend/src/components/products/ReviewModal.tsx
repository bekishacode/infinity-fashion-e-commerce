// src/components/products/ReviewModal.tsx
import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { CanReviewResponse } from '../../types/review.types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted
}) => {
  const [step, setStep] = useState<'verify' | 'form' | 'success'>('verify');
  const [phone, setPhone] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyPhone = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/products/can-review.php?product_id=${productId}&phone=${phone}`);
      
      if (response.success && response.data) {
        const data = response.data as CanReviewResponse;
        setCustomerId(data.customer_id);
        setOrderId(data.order_id);
        setStep('form');
        setError(null);
      } else {
        // Display the specific error message from the API
        setError(response.message || 'Unable to verify your purchase. Please check your phone number.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (!review || review.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post('/products/submit-review.php', {
        product_id: productId,
        customer_id: customerId,
        phone: phone,
        rating: rating,
        title: title,
        review: review
      });

      if (response.success) {
        setStep('success');
        onReviewSubmitted();
        // Auto-close after 4 seconds
        setTimeout(() => {
          onClose();
          // Reset state after closing
          setTimeout(() => {
            setStep('verify');
            setPhone('');
            setRating(0);
            setTitle('');
            setReview('');
            setCustomerId(null);
            setError(null);
          }, 300);
        }, 4000);
      } else {
        setError(response.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number, interactive = true) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {step === 'verify' && 'Verify Your Purchase'}
            {step === 'form' && `Review ${productName}`}
            {step === 'success' && 'Review Submitted! 🎉'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'verify' && (
            <div>
              <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <p className="font-medium">📝 Only verified purchases can leave reviews</p>
                <p className="text-xs mt-1 text-blue-600">
                  Please enter the phone number you used when placing your order.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 0912345678"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter the phone number you used when you purchased this product
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleVerifyPhone}
                disabled={loading}
                className="w-full bg-royal-blue text-white py-2 rounded-lg font-medium hover:bg-royal-blue-dark transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </div>
          )}

          {step === 'form' && (
            <div>
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Purchase verified! You can now leave a review.</span>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex flex-col items-center gap-2">
                  {renderStars(rating)}
                  <span className="text-sm text-gray-500">
                    {rating > 0 ? `${rating} out of 5 stars` : 'Tap a star to rate'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  maxLength={255}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue resize-none"
                  minLength={10}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 10 characters
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="w-full bg-royal-blue text-white py-2 rounded-lg font-medium hover:bg-royal-blue-dark transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600 mb-3">
                Your review has been submitted successfully.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-4">
                <p className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="text-lg">⏳</span>
                  <span>
                    <strong>Pending Approval:</strong> Your review will be published once it's reviewed by our admin team. You'll see it here soon!
                  </span>
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">
                  You rated this product {rating} out of 5 stars
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    setStep('verify');
                    setPhone('');
                    setRating(0);
                    setTitle('');
                    setReview('');
                    setCustomerId(null);
                    setError(null);
                  }, 300);
                }}
                className="px-6 py-2.5 bg-royal-blue text-white rounded-lg font-medium hover:bg-royal-blue-dark transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;