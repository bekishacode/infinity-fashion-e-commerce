import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-royal-blue to-magenta rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IF</span>
              </div>
              <div>
                <span className="text-royal-blue font-bold text-lg">Infinity</span>
                <span className="text-magenta font-bold text-lg">Fashion</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Custom printing on t-shirts, caps, bags, and more. Quality prints delivered across Ethiopia.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-royal-blue transition text-sm">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-royal-blue transition text-sm">Products</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-royal-blue transition text-sm">Cart</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-royal-blue transition text-sm">Track Order</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>+251 XX XXX XXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>✉️</span>
                <span>info@infinityfashion.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📍</span>
                <span>Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>
          
          {/* Working Hours */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Working Hours</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Monday - Friday: 9AM - 6PM</li>
              <li>Saturday: 10AM - 4PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Infinity Fashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
