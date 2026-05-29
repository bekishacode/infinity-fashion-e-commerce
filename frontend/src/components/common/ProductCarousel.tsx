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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Update items per view based on screen size
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

  // Calculate card width based on items per view
  const getCardWidth = () => {
    if (!scrollContainerRef.current) return 0;
    const containerWidth = scrollContainerRef.current.clientWidth;
    return containerWidth / itemsPerView;
  };

  // Scroll to current index
  useEffect(() => {
    if (scrollContainerRef.current && !isDragging.current) {
      const cardWidth = getCardWidth();
      if (cardWidth > 0) {
        scrollContainerRef.current.scrollTo({
          left: currentIndex * cardWidth,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex, itemsPerView]);

  // Auto-play
  useEffect(() => {
    if (products.length > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex, products.length, itemsPerView]);

  const nextSlide = () => {
    const maxIndex = Math.ceil(products.length / itemsPerView) - 1;
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    const maxIndex = Math.ceil(products.length / itemsPerView) - 1;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(maxIndex);
    }
  };

  // Touch handlers for fast dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startX.current) * 1.2; // Fast sliding
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    if (!scrollContainerRef.current) return;
    isDragging.current = false;
    
    const cardWidth = getCardWidth();
    if (cardWidth > 0) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / cardWidth);
      const maxIndex = Math.ceil(products.length / itemsPerView) - 1;
      const finalIndex = Math.min(Math.max(0, newIndex), maxIndex);
      setCurrentIndex(finalIndex);
    }
    
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  // Product Card with fixed width
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="px-2" style={{ width: `${100 / itemsPerView}%`, flexShrink: 0 }}>
      <Link to={`/product/${product.id}`} className="block h-full">
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
            <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 text-charcoal group-hover:text-royal-blue transition line-clamp-2">
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
    </div>
  );

  if (products.length === 0) return null;

  const totalPages = Math.ceil(products.length / itemsPerView);

  return (
    <div className="mb-12 sm:mb-16">
      {/* Header */}
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

      {/* Touch Slider Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto hide-scrollbar"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex" style={{ width: `${products.length * (100 / itemsPerView)}%` }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (scrollContainerRef.current) {
                    const cardWidth = getCardWidth();
                    scrollContainerRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-royal-blue'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;