import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
  bgGradient: string;
  buttonText: string;
  buttonLink: string;
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: "Custom T-Shirt Printing",
      subtitle: "Express Yourself",
      description: "Create your unique style with our high-quality custom t-shirt printing. Choose from various colors, sizes, and materials.",
      image: "/images/t-shirt.jpeg",
      icon: "👕",
      bgGradient: "from-royal-blue via-royal-blue-dark to-magenta",
      buttonText: "Explore T-Shirts",
      buttonLink: "/products?category=t-shirts"
    },
    {
      id: 2,
      title: "Personalized Caps",
      subtitle: "Top Off Your Style",
      description: "Stand out with custom embroidered caps. Perfect for events, promotions, or personal use.",
      image: "/images/cape.jpeg",
      icon: "🧢",
      bgGradient: "from-orange via-orange-dark to-royal-blue",
      buttonText: "Shop Caps",
      buttonLink: "/products?category=caps"
    },
    {
      id: 3,
      title: "Custom Bags & Totes",
      subtitle: "Carry Your Identity",
      description: "Eco-friendly custom printed bags. Great for shopping, work, or gifting.",
      image: "/images/bag.jpeg",
      icon: "👜",
      bgGradient: "from-green via-green-dark to-royal-blue",
      buttonText: "View Bags",
      buttonLink: "/products?category=bags"
    },
    {
      id: 4,
      title: "Premium Hoodies",
      subtitle: "Stay Cozy & Stylish",
      description: "Stay cozy with custom printed hoodies. Perfect for all seasons.",
      image: "/images/hoodie.jpeg",
      icon: "👔",
      bgGradient: "from-magenta via-magenta-dark to-orange",
      buttonText: "Shop Hoodies",
      buttonLink: "/products?category=hoodies"
    }
  ];

  const nextSlide = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsAnimating(false);
    }, 400);
  }, [heroSlides.length]);

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const currentItem = heroSlides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Gradient - Full Width */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.bgGradient} transition-all duration-700`}>
        {/* Animated particles/patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>
      </div>

      {/* Content Container - Medium/Balanced Height */}
      <div className="relative container mx-auto px-4 py-14 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[450px] md:min-h-[520px]">
          {/* Left Side - Text Content */}
          <div className={`text-white transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-[-20px]' : 'opacity-100 transform translate-x-0'}`}>
            <div className="inline-block mb-4 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold animate-fade-in">
              {currentItem.icon} {currentItem.subtitle}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 animate-fade-in">
              {currentItem.title}
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8 animate-slide-up leading-relaxed">
              {currentItem.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Link 
                to={currentItem.buttonLink}
                className="bg-white text-royal-blue px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 text-center text-sm md:text-base"
              >
                {currentItem.buttonText} →
              </Link>
              <Link 
                to="/products"
                className="border-2 border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-royal-blue transition text-center text-sm md:text-base"
              >
                View All Products
              </Link>
            </div>
          </div>

          {/* Right Side - Image - Medium/Balanced Height */}
          <div className={`relative transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-[20px]' : 'opacity-100 transform translate-x-0'}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {!imageErrors[currentItem.id] ? (
                <img 
                  src={currentItem.image} 
                  alt={currentItem.title}
                  className="w-full h-[280px] md:h-[360px] lg:h-[420px] object-cover"
                  onError={() => handleImageError(currentItem.id)}
                />
              ) : (
                <div className="w-full h-[280px] md:h-[360px] lg:h-[420px] bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl md:text-8xl mb-4">{currentItem.icon}</div>
                    <p className="text-white/60 text-sm">Product preview</p>
                  </div>
                </div>
              )}
              
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Navigation Dots - Only navigation remaining */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center space-x-2 md:space-x-3 z-10">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 ${
                currentSlide === idx 
                  ? 'w-8 md:w-12 h-1.5 bg-white rounded-full' 
                  : 'w-4 md:w-6 h-1.5 bg-white/40 rounded-full hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;