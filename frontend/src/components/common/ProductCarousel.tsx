import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../services/productService';

interface ProductCarouselProps {
  products: Product[];
  title: string;
  icon: string;
  bgColor: string;
  onViewAll?: () => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  products, 
  title, 
  icon, 
  bgColor, 
  onViewAll 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const dragTimeoutRef = useRef<NodeJS.Timeout>();

  // Create infinite array by duplicating products 3 times
  const infiniteProducts = [...products, ...products, ...products];
  const totalItems = infiniteProducts.length;
  const itemsPerSlide = itemsPerView;
  const totalSlides = Math.ceil(totalItems / itemsPerSlide);
  const centerIndex = Math.floor(totalSlides / 3);
  const actualProductCount = Math.ceil(products.length / itemsPerView);

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 768) {
        setItemsPerView(2);
      } else if (width < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Set initial position to center
  useEffect(() => {
    if (products.length > 0) {
      setCurrentIndex(centerIndex);
    }
  }, [products.length, centerIndex]);

  // Auto-play functionality - slower
  useEffect(() => {
    if (products.length > itemsPerView && !isDragging) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, products.length, itemsPerView, isDragging]);

  const nextSlide = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev - 1);
  };

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex >= totalSlides - centerIndex) {
      setTimeout(() => {
        setCurrentIndex(centerIndex);
      }, 300);
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setCurrentIndex(centerIndex);
      }, 300);
    }
  }, [currentIndex, totalSlides, centerIndex]);

  // Touch handlers for REAL sliding
  const handleTouchStart = (e: React.TouchEvent) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
    setIsDragging(true);
    
    // Add grab cursor style
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    setTouchEndX(currentX);
    
    // Calculate drag offset for visual feedback
    const diff = currentX - touchStartX;
    const containerWidth = carouselRef.current?.offsetWidth || 0;
    const dragPercentage = (diff / containerWidth) * 100;
    
    // Limit drag resistance
    const limitedDrag = Math.min(Math.max(dragPercentage, -30), 30);
    setDragOffset(limitedDrag);
    
    // Apply drag transform
    if (carouselRef.current) {
      const wrapper = carouselRef.current.querySelector('.carousel-wrapper') as HTMLElement;
      if (wrapper) {
        const currentTransform = -currentIndex * 100;
        wrapper.style.transform = `translateX(calc(${currentTransform}% + ${limitedDrag}px))`;
        wrapper.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Reset cursor
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
    
    // Determine if swipe was significant
    const diff = touchEndX - touchStartX;
    const threshold = 50; // Minimum swipe distance
    
    // Reset drag offset
    setDragOffset(0);
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe right - go to previous
        prevSlide();
      } else {
        // Swipe left - go to next
        nextSlide();
      }
    } else {
      // Reset position without changing slide
      if (carouselRef.current) {
        const wrapper = carouselRef.current.querySelector('.carousel-wrapper') as HTMLElement;
        if (wrapper) {
          wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
          wrapper.style.transition = 'transform 0.3s ease-out';
        }
      }
    }
    
    // Restart auto-play after 10 seconds
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    dragTimeoutRef.current = setTimeout(() => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }, 10000);
  };

  // Reset transform when currentIndex changes
  useEffect(() => {
    if (!isDragging && carouselRef.current) {
      const wrapper = carouselRef.current.querySelector('.carousel-wrapper') as HTMLElement;
      if (wrapper) {
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        wrapper.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
      }
    }
  }, [currentIndex, isDragging]);

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => (
    <Link to={`/product/${product.id}`} className="block h-full px-2">
      <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative">
          <div className="text-5xl sm:text-6xl py-8 sm:py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
            {product.icon}
          </div>
          {product.badge && (
            <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
              {product.badge}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 text-charcoal group-hover:text-royal-blue transition line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <p className="text-royal-blue font-bold text-base sm:text-lg md:text-xl">ETB {product.price}</p>
            {product.originalPrice && (
              <p className="text-gray-400 line-through text-xs sm:text-sm">ETB {product.originalPrice}</p>
            )}
          </div>
          <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-1.5 sm:py-2 rounded-lg hover:shadow-lg transition text-xs sm:text-sm md:text-base mt-auto">
            {product.serviceType === 'wholesale' ? 'Request Quote' : 
             product.serviceType === 'pod' ? 'Customize Now' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );

  if (products.length === 0) return null;

  return (
    <div className="mb-12 sm:mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`text-xl sm:text-2xl md:text-3xl ${bgColor} w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white`}>
            {icon}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-charcoal">{title}</h2>
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {products.length}
          </span>
        </div>
        {onViewAll && products.length > itemsPerView && (
          <button 
            onClick={onViewAll}
            className="text-royal-blue hover:text-royal-blue-dark font-semibold text-xs sm:text-sm md:text-base"
          >
            View All ({products.length}) →
          </button>
        )}
      </div>

      {/* Carousel Container - Touch Sliding Enabled */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden select-none"
        style={{ cursor: 'grab' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-wrapper" style={{ width: '100%' }}>
          <div className="flex">
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const startIdx = slideIndex * itemsPerSlide;
              const slideProducts = infiniteProducts.slice(startIdx, startIdx + itemsPerSlide);
              return (
                <div key={slideIndex} className="flex-shrink-0 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {slideProducts.map((product, idx) => (
                      <ProductCard key={`${slideIndex}-${idx}`} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {products.length > itemsPerView && (
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
          {Array.from({ length: actualProductCount }).map((_, idx) => {
            const isActive = (currentIndex % actualProductCount) === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx + centerIndex);
                }}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-royal-blue'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;