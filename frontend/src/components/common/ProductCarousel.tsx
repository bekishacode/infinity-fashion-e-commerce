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
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [animation, setAnimation] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  
  // Create infinite array by duplicating products 3 times
  const infiniteProducts = [...products, ...products, ...products];
  const totalItems = infiniteProducts.length;
  const itemsPerSlide = itemsPerView;
  const totalSlides = Math.ceil(totalItems / itemsPerSlide);
  const centerIndex = Math.floor(totalSlides / 3);

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

  // Auto-play functionality
  useEffect(() => {
    if (products.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, products.length, itemsPerView]);

  const nextSlide = () => {
    setAnimation(true);
    setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    setAnimation(true);
    setCurrentIndex(prev => prev - 1);
  };

  // Handle infinite loop reset
  useEffect(() => {
    if (currentIndex >= totalSlides - centerIndex) {
      setTimeout(() => {
        setAnimation(false);
        setCurrentIndex(centerIndex);
        setTimeout(() => setAnimation(true), 50);
      }, 300);
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setAnimation(false);
        setCurrentIndex(centerIndex);
        setTimeout(() => setAnimation(true), 50);
      }, 300);
    }
  }, [currentIndex, totalSlides, centerIndex]);

  // Touch/Drag handlers for gallery-like experience
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    
    setIsDragging(true);
    setAnimation(false);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setPrevTranslate(currentTranslate);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    const containerWidth = carouselRef.current?.offsetWidth || 0;
    const dragPercentage = (diff / containerWidth) * 100;
    
    setCurrentTranslate(prevTranslate + dragPercentage);
  };

  const handleDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setAnimation(true);
    
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = clientX - startX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    
    setCurrentTranslate(0);
    setPrevTranslate(0);
    
    // Restart auto-play
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  // Prevent default touch behavior
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  // Get visible products for current slide
  const getVisibleProducts = () => {
    const startIdx = currentIndex * itemsPerSlide;
    const endIdx = Math.min(startIdx + itemsPerSlide, totalItems);
    return infiniteProducts.slice(startIdx, endIdx);
  };

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

  const visibleProducts = getVisibleProducts();
  const transformValue = currentTranslate;

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

      {/* Carousel Container with Touch/Drag Support */}
      <div 
        className="relative overflow-hidden select-none"
        onTouchStart={handleDragStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div 
          ref={carouselRef}
          className="transition-transform"
          style={{
            transform: animation ? `translateX(-${currentIndex * 100}%)` : `translateX(calc(-${currentIndex * 100}% + ${transformValue}px))`,
            transition: animation && !isDragging ? 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' : 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
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
          {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, idx) => {
            const actualIndex = idx + (centerIndex % Math.ceil(products.length / itemsPerView));
            return (
              <button
                key={idx}
                onClick={() => {
                  setAnimation(true);
                  setCurrentIndex(actualIndex);
                }}
                className={`transition-all duration-300 rounded-full ${
                  (currentIndex % Math.ceil(products.length / itemsPerView)) === idx
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