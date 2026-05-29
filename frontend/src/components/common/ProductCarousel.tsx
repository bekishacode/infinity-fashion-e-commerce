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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const touchTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Create an infinite array by duplicating products
  const infiniteProducts = [...products, ...products, ...products];
  const totalSlides = Math.ceil(infiniteProducts.length / itemsPerView);
  const middleIndex = Math.floor(totalSlides / 3);
  
  // Reset to middle when component mounts
  useEffect(() => {
    if (products.length > 0) {
      setCurrentIndex(middleIndex);
    }
  }, [products.length, itemsPerView, middleIndex]);

  // Auto-play functionality - slower speed
  useEffect(() => {
    if (products.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 8000); // 8 seconds - slower
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, products.length, itemsPerView]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
    
    // Add drag effect
    if (containerRef.current) {
      const container = containerRef.current;
      const slides = container.children;
      const currentSlide = slides[currentIndex] as HTMLElement;
      if (currentSlide) {
        currentSlide.style.transform = `translateX(${diff}px)`;
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    const threshold = 50; // Minimum swipe distance
    
    if (containerRef.current) {
      const container = containerRef.current;
      const slides = container.children;
      const currentSlide = slides[currentIndex] as HTMLElement;
      if (currentSlide) {
        currentSlide.style.transform = '';
      }
    }
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe right - go to previous
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else {
        // Swipe left - go to next
        nextSlide();
      }
    }
    
    setTranslateX(0);
    
    // Restart auto-play after 10 seconds of inactivity
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = setTimeout(() => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 8000);
    }, 10000);
  };

  // Reset infinite loop when reaching boundaries
  useEffect(() => {
    if (currentIndex >= totalSlides - Math.ceil(products.length / itemsPerView)) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(middleIndex);
      }, 500);
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(middleIndex);
      }, 500);
    }
  }, [currentIndex, totalSlides, products.length, itemsPerView, middleIndex]);

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

  // Create visible slides
  const visibleSlides = [];
  for (let i = 0; i < totalSlides; i++) {
    const startIdx = i * itemsPerView;
    const slideProducts = infiniteProducts.slice(startIdx, startIdx + itemsPerView);
    visibleSlides.push(slideProducts);
  }

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

      {/* Carousel Container - Touch/Drag enabled */}
      <div 
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={containerRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-out' : 'none'
          }}
        >
          {visibleSlides.map((slide, idx) => (
            <div key={idx} className="flex-shrink-0 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {slide.map((product, productIdx) => (
                  <ProductCard key={`${idx}-${productIdx}`} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {products.length > itemsPerView && (
        <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
          {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx + Math.floor(middleIndex / 2));
              }}
              className={`transition-all duration-300 rounded-full ${
                idx === (currentIndex % Math.ceil(products.length / itemsPerView))
                  ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-royal-blue'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;