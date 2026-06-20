import React, { useState } from 'react';
import HeroSection from '../../components/home/HeroSection';
import { Link } from 'react-router-dom';
import ScrollReveal from '../../components/common/ScrollReveal';
import CountUp from '../../components/common/CountUp';

const Home: React.FC = () => {
  const [activeService, setActiveService] = useState('all');

  const features = [
    { icon: '🎨', title: 'Custom Design', color: 'royal-blue', desc: 'Upload your own design or choose from our templates' },
    { icon: '🚚', title: 'Fast Delivery', color: 'orange', desc: 'Delivery across Ethiopia within 3-5 days' },
    { icon: '💯', title: 'Quality Guarantee', color: 'green', desc: 'High-quality printing on premium products' },
  ];

  // Service Categories (Wholesale, Retail, Print on Demand)
  const serviceCategories = [
    {
      id: 'pod',
      title: 'Print on Demand',
      subtitle: 'Custom Designs',
      icon: '🎨',
      description: 'Upload your design. We print and ship. No inventory needed.',
      features: ['No minimum', 'Design upload', 'Preview before print', 'Dropshipping available'],
      gradient: 'from-green to-magenta',
      cta: 'Start Designing',
      ctaLink: '/print-on-demand'
    },
    {
      id: 'retail',
      title: 'Retail',
      subtitle: 'Individual & Gift Shopping',
      icon: '🛍️',
      description: 'Single item purchases. Latest trends and styles for everyone.',
      features: ['No minimum order', 'Fast shipping', 'Easy returns', 'Secure checkout'],
      gradient: 'from-orange to-royal-blue',
      cta: 'Shop Now',
      ctaLink: '/products?type=retail'
    },
    {
      id: 'wholesale',
      title: 'Wholesale',
      subtitle: 'Bulk Orders & Corporate',
      icon: '🏭',
      description: '50+ pieces minimum. Perfect for businesses, events, and organizations.',
      features: ['Bulk pricing', 'Custom logo printing', 'Sample available', '15-20 days delivery'],
      gradient: 'from-royal-blue to-magenta',
      cta: 'Request Quote',
      ctaLink: '/wholesale'
    }
  ];

  // Featured Products by category
  const featuredProducts = [
    { id: 1, name: 'Custom T-Shirt', price: 350, category: 'retail', icon: '👕', badge: 'Best Seller', badgeColor: 'bg-orange' },
    { id: 2, name: 'Personalized Cap', price: 250, category: 'retail', icon: '🧢', badge: 'New', badgeColor: 'bg-green' },
    { id: 3, name: 'Bulk Polo Shirts', price: 220, category: 'wholesale', icon: '👔', badge: 'Bulk Order', badgeColor: 'bg-royal-blue' },
    { id: 4, name: 'Custom Hoodie (POD)', price: 650, category: 'pod', icon: '🧥', badge: 'Design Now', badgeColor: 'bg-magenta' },
    { id: 5, name: 'Custom Bag', price: 450, category: 'retail', icon: '👜', badge: 'Eco-Friendly', badgeColor: 'bg-green' },
    { id: 6, name: 'Work Uniform Set', price: 1200, category: 'wholesale', icon: '👕', badge: 'Corporate', badgeColor: 'bg-royal-blue' },
  ];

  // Portfolio/Success Stories
  const portfolioItems = [
    { id: 1, title: 'Corporate Uniforms', client: 'Ethiopian Airlines', image: '/images/Logo.png', category: 'wholesale' },
    { id: 2, title: 'Event T-Shirts', client: 'Addis Marathon', image: '/images/magenta-shirt.png', category: 'wholesale' },
    { id: 3, title: 'Custom Gift Mugs', client: 'Coffee Festival', image: '/images/blue.png', category: 'pod' },
    { id: 4, title: 'Branded Caps', client: 'Local Business Expo', image: '/images/cap-orange.png', category: 'wholesale' },
  ];

  const filteredProducts = activeService === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(p => p.category === activeService);

  return (
    <div className="w-full overflow-x-hidden mt-10">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Service Categories - Three main business lines */}
      <ScrollReveal direction="up">
        <div className="w-full px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-charcoal">
              <span className="text-royal-blue">How</span> We Serve You
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Choose the service that fits your needs - from bulk wholesale to individual custom prints
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {serviceCategories.map((service) => (
                <div 
                  key={service.id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
                >
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${service.gradient}`}></div>
                  <div className="p-8">
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="text-2xl font-bold mb-2 text-charcoal">{service.title}</h3>
                    <p className="text-sm text-orange font-semibold mb-4">{service.subtitle}</p>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to={service.ctaLink}
                      className={`inline-block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r ${service.gradient} text-white hover:shadow-lg transform hover:scale-105`}
                    >
                      {service.cta} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Section - With Animated Counters */}
      <ScrollReveal direction="up">
        <div className="w-full bg-gradient-to-r from-royal-blue to-magenta py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  <CountUp end={50000} suffix="+" />
                </div>
                <div className="text-white/80 text-sm">Products Delivered</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl mb-2">🏢</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  <CountUp end={1000} suffix="+" />
                </div>
                <div className="text-white/80 text-sm">Happy Businesses</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl mb-2">🎨</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  <CountUp end={5000} suffix="+" />
                </div>
                <div className="text-white/80 text-sm">Custom Designs</div>
              </div>
              <div className="text-center text-white">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  <CountUp end={98} suffix="%" />
                </div>
                <div className="text-white/80 text-sm">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Dynamic Products Section with Category Filter */}
      <ScrollReveal direction="up">
        <div className="w-full px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-charcoal">Featured Products</h2>
            <p className="text-center text-gray-600 mb-8">Explore our latest collection</p>
            
            {/* Category Tabs - Responsive for mobile */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
              {['all', 'retail', 'wholesale', 'pod'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveService(tab)}
                  className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full font-semibold transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                    activeService === tab
                      ? 'bg-royal-blue text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' ? 'All Products' : tab === 'pod' ? 'Print on Demand' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                  <div className="relative">
                    <div className="text-6xl md:text-7xl py-6 md:py-8 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                      {product.icon}
                    </div>
                    {product.badge && (
                      <span className={`absolute top-2 right-2 md:top-3 md:right-3 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2 text-charcoal">{product.name}</h3>
                    <p className="text-royal-blue font-bold text-lg md:text-xl mb-2 md:mb-3">ETB {product.price}</p>
                    
                    {/* Different CTAs based on product type */}
                    {product.category === 'wholesale' ? (
                      <Link to="/wholesale/inquiry" className="block w-full bg-royal-blue text-white text-center py-1.5 md:py-2 rounded-lg text-sm md:text-base hover:bg-royal-blue-dark transition">
                        Request Quote
                      </Link>
                    ) : product.category === 'pod' ? (
                      <Link to="/print-on-demand/customize" className="block w-full bg-magenta text-white text-center py-1.5 md:py-2 rounded-lg text-sm md:text-base hover:bg-magenta-dark transition">
                        Customize Now
                      </Link>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-1.5 md:py-2 rounded-lg text-sm md:text-base hover:shadow-lg transition">
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 md:mt-12">
              <Link to="/products" className="inline-block bg-gradient-to-r from-royal-blue to-magenta text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105 text-sm md:text-base">
                View All Products →
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Portfolio/Success Stories Section */}
      <ScrollReveal direction="up">
        <div className="w-full bg-royal-blue-dark py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">Our <span className='text-orange'>Success</span> Stories</h2>
            <p className="text-center text-white mb-12">Trusted by businesses across Ethiopia</p>
            
            <div className="grid md:grid-cols-4 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-5xl">🏢</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.client}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-royal-blue/10 text-royal-blue">
                      {item.category === 'wholesale' ? 'Wholesale' : 'Print on Demand'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Features Section */}
      <ScrollReveal direction="up">
        <div className="w-full px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-charcoal">
              <span className="text-orange">Why</span> Choose Us
            </h2>
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
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Home;