import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  // Carousel data
  const carouselItems = [
    {
      id: 1,
      title: "Custom T-Shirt Printing",
      description: "Create your unique style with our high-quality custom t-shirt printing. Choose from various colors, sizes, and materials.",
      features: ["Premium cotton material", "Fade-resistant printing", "Available in all sizes"],
      image: "/images/t-shirt.jpeg",
      icon: "👕",
      bgGradient: "from-royal-blue to-magenta"
    },
    {
      id: 2,
      title: "Personalized Caps",
      description: "Stand out with custom embroidered caps. Perfect for events, promotions, or personal use.",
      features: ["Adjustable fit", "High-quality embroidery", "Multiple color options"],
      image: "/images/cap.jpeg",
      icon: "🧢",
      bgGradient: "from-orange to-royal-blue"
    },
    {
      id: 3,
      title: "Custom Bags & Totes",
      description: "Eco-friendly custom printed bags. Great for shopping, work, or gifting.",
      features: ["Durable material", "Custom designs", "Reusable and eco-friendly"],
      image: "/images/bag.jpeg",
      icon: "👜",
      bgGradient: "from-green to-royal-blue"
    },
    {
      id: 4,
      title: "Premium Hoodies",
      description: "Stay cozy with custom printed hoodies. Perfect for all seasons.",
      features: ["Warm and comfortable", "Premium quality", "Custom artwork"],
      image: "/images/hoddie.jpeg",
      icon: "👔",
      bgGradient: "from-magenta to-orange"
    }
  ];

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const nextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
  };

  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const currentItem = carouselItems[currentSlide];

  const features = [
    { icon: '🎨', title: 'Custom Design', color: 'royal-blue', desc: 'Upload your own design or choose from our templates' },
    { icon: '🚚', title: 'Fast Delivery', color: 'orange', desc: 'Delivery across Ethiopia within 3-5 days' },
    { icon: '💯', title: 'Quality Guarantee', color: 'green', desc: 'High-quality printing on premium products' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Custom T-Shirt', price: 350, icon: '👕' },
    { id: 2, name: 'Personalized Cap', price: 250, icon: '🧢' },
    { id: 3, name: 'Custom Bag', price: 450, icon: '👜' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in text-royal-blue">
            Infinity <span className='text-magenta'>Fashion</span>
          </h1>
          <p className="text-xl text-charcoal mb-8 animate-slide-up">
            Custom Printing on T-Shirts, Caps, Bags & More
          </p>
          <Link 
            to="/products" 
            className="bg-gradient-to-br from-royal-blue to-magenta text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>
      
      {/* Image Carousel Section - Split Layout with Fixed Height */}
      <div className="container mx-auto px-4 py-2">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0 h-[500px] md:h-[550px]">
            {/* Left Side - Description */}
            <div className={`hidden md:block p-8 md:p-12 bg-gradient-to-br ${currentItem.bgGradient} text-white transition-all duration-500 overflow-y-auto`}>
              <div className="h-full flex flex-col justify-center">
                <div className="text-6xl mb-6 animate-bounce-slow">{currentItem.icon}</div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 animate-fade-in">
                  {currentItem.title}
                </h2>
                <p className="text-white/90 text-base md:text-lg mb-6 animate-slide-up">
                  {currentItem.description}
                </p>
                <ul className="space-y-2 mb-8">
                  {currentItem.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-white/90 animate-fade-in text-sm md:text-base" style={{ animationDelay: `${idx * 100}ms` }}>
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/products" 
                  className="inline-block bg-white text-royal-blue px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 w-fit text-sm md:text-base"
                >
                  Shop Now →
                </Link>
              </div>
            </div>
            
            {/* Right Side - Image Display with Fixed Height */}
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 h-[500px] md:h-[550px]">
              {/* Actual Image */}
              {!imageErrors[currentItem.id] ? (
                <img 
                  src={currentItem.image} 
                  alt={currentItem.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                  onError={() => handleImageError(currentItem.id)}
                />
              ) : (
                /* Fallback - Show icon when image fails to load */
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-royal-blue/20 to-magenta/20 flex items-center justify-center transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="text-center">
                    <div className="text-8xl md:text-9xl mb-4 animate-pulse">{currentItem.icon}</div>
                    <p className="text-white/60 text-xs md:text-sm">Product image preview</p>
                    <p className="text-white/40 text-xs mt-2">Add image to: public{currentItem.image}</p>
                  </div>
                </div>
              )}
              
              {/* Image Navigation Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                {carouselItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`transition-all duration-300 ${
                      currentSlide === idx 
                        ? 'w-8 h-2 bg-white rounded-full' 
                        : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                aria-label="Previous slide"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                aria-label="Next slide"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-charcoal">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className={`text-xl font-semibold mb-2 text-${feature.color}`}>{feature.title}</h3>
              <p className="text-charcoal">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-charcoal">Featured Products</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 text-center">
                <div className="text-6xl mb-4">{product.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-charcoal">{product.name}</h3>
                <p className="text-royal-blue font-bold text-xl mb-4">ETB {product.price}</p>
                <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-2 rounded-lg hover:shadow-lg transition">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;