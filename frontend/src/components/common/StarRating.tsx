// src/components/common/StarRating.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${sizeMap[size]} text-yellow-400 fill-yellow-400`} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`${sizeMap[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeMap[size]} text-yellow-400 fill-yellow-400`} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${sizeMap[size]} text-gray-300`} />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;