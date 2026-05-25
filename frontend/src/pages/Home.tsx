import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    { icon: '🎨', title: 'Custom Design', color: 'royal-blue', desc: 'Upload your own design or choose from our templates' },
    { icon: '🚚', title: 'Fast Delivery', color: 'green', desc: 'Delivery across Ethiopia within 3-5 days' },
    { icon: '💯', title: 'Quality Guarantee', color: 'orange', desc: 'High-quality printing on premium products' },
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
          <h1 className="text-5xl font-bold mb-4 animate-fade-in text-royal-blue">Infinity <span className='text-magenta'>Fashion</span></h1>
          <p className="text-xl text-charcoal mb-8 animate-slide-up">Custom Printing on T-Shirts, Caps, Bags & More</p>
          <Link to="/products" className="bg-gradient-to-br from-royal-blue to-magenta rounded-lg px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block transition">
            Shop Now
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center gradient-primary hover-lift">
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
                <button className="w-full bg-royal-blue text-white py-2 rounded-lg hover:bg-royal-blue-dark transition">
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
