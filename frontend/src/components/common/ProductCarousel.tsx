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
//Not Using this currently
const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  products, 
  title, 
  icon, 
  bgColor, 
  onViewAll 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isResetting = useRef(false);

  const totalPages = Math.ceil(products.length / itemsPerView);
  const cloneCount = itemsPerView;
  const clonedProducts = [...products, ...products.slice(0, cloneCount)];

  // Helper function to get image URL
  const getImageUrl = (product: Product): string => {
    if (!product.images) return '';
    if (typeof product.images === 'string') return product.images;
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return '';
  };

  // ─── Responsive items per view (max 3) ───────────────────────────────────
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(1);
      else if (width < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const getCardWidth = () => {
    if (!scrollContainerRef.current) return 0;
    return scrollContainerRef.current.clientWidth / itemsPerView;
  };

  const scrollToIndex = (index: number, smooth: boolean) => {
    if (!scrollContainerRef.current) return;
    const cw = getCardWidth();
    if (cw === 0) return;
    scrollContainerRef.current.scrollTo({
      left: index * cw,
      behavior: smooth ? 'smooth' : 'instant' as ScrollBehavior,
    });
  };

  useEffect(() => {
    if (!isDragging.current && !isResetting.current) {
      scrollToIndex(currentIndex, true);
    }
  }, [currentIndex, itemsPerView]);

  const nextSlide = () => {
    if (isResetting.current) return;
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      isResetting.current = true;
      scrollToIndex(totalPages, true);
      setTimeout(() => {
        scrollToIndex(0, false);
        setCurrentIndex(0);
        isResetting.current = false;
      }, 500);
    }
  };

  useEffect(() => {
    if (products.length > itemsPerView) {
      autoPlayRef.current = setInterval(nextSlide, 4000);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [currentIndex, products.length, itemsPerView]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startX.current) * 1.2;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    if (!scrollContainerRef.current) return;
    isDragging.current = false;
    const cw = getCardWidth();
    if (cw > 0) {
      const scrollPosition = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / cw);
      const finalIndex = Math.min(Math.max(0, newIndex), totalPages - 1);
      setCurrentIndex(finalIndex);
    }
    autoPlayRef.current = setInterval(nextSlide, 4000);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const imageUrl = getImageUrl(product);
    const hasError = imageErrors[product.id];
    
    return (
      <div className="flex-shrink-0 px-2" style={{ width: `${100 / itemsPerView}%` }}>
        <Link to={`/product/${product.id}`} className="block h-full">
          <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer h-full flex flex-col">
            <div className="relative">
              {imageUrl && !hasError ? (
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover bg-gradient-to-br from-gray-50 to-gray-100"
                  onError={() => setImageErrors(prev => ({ ...prev, [product.id]: true }))}
                />
              ) : (
                <div className="text-5xl sm:text-6xl py-8 sm:py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.icon}
                </div>
              )}
              {product.badge && (
                <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 ${product.badge_color} text-white text-xs px-2 py-1 rounded-full`}>
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 text-charcoal group-hover:text-royal-blue transition line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <p className="text-royal-blue font-bold text-base sm:text-lg md:text-xl">ETB {product.price}</p>
                {product.compare_price && (
                  <p className="text-gray-400 line-through text-xs sm:text-sm">ETB {product.compare_price}</p>
                )}
              </div>
              <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-2 rounded-lg hover:shadow-lg transition text-sm sm:text-base md:text-base mt-auto">
                {product.service_type === 'wholesale' ? 'Request Quote' : 
                 product.service_type=== 'pod' ? 'Customize Now' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-12 sm:mb-16">
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

      {/* ↓ overflow-hidden clips the cloned cards and the partial 4th card */}
      <div className="relative overflow-hidden">
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
          <div className="flex">
            {clonedProducts.map((product, idx) => (
              <ProductCard key={`${product.id}-${idx}`} product={product} />
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  scrollToIndex(idx, true);
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