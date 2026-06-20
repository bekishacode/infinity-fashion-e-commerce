import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/infinityfashion',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
        </svg>
      ),
      color: 'hover:text-[#1877F2]'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/infinityfashion',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'hover:text-[#E4405F]'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/251941211242',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.562 1.097 3.639l-.608 2.166 2.236-.585c1.061.576 2.263.88 3.49.879 3.181 0 5.768-2.587 5.768-5.768-.001-3.18-2.587-5.767-5.767-5.767zm2.434 8.116c-.158.46-.794.88-1.298.94-.352.04-.788.05-1.197-.08-.346-.11-.67-.25-.97-.42-.49-.27-.93-.62-1.31-1.03-.38-.42-.7-.89-.93-1.4-.13-.29-.25-.6-.33-.92-.07-.28-.09-.58-.05-.86.04-.24.14-.46.28-.66.06-.08.13-.15.2-.22.09-.1.18-.18.26-.28.1-.11.18-.23.25-.36.07-.14.12-.29.14-.45.02-.16 0-.32-.05-.48-.04-.13-.1-.26-.17-.38-.08-.13-.17-.25-.27-.36-.1-.11-.21-.21-.32-.3-.12-.1-.25-.18-.38-.25-.26-.12-.53-.18-.8-.17-.24.01-.48.04-.71.1-.23.06-.44.16-.64.28-.31.2-.59.44-.84.72-.38.43-.67.93-.86 1.48-.19.55-.28 1.13-.26 1.71.01.24.04.48.09.72.06.25.13.49.23.73.11.25.24.49.39.73.15.24.33.46.52.67.24.26.51.49.8.7.33.24.69.44 1.07.6.39.17.8.3 1.22.38.41.08.83.12 1.25.1.41-.02.82-.08 1.22-.2.4-.11.79-.28 1.13-.5.3-.19.57-.42.8-.68.2-.24.36-.52.48-.81.1-.27.16-.56.18-.85.03-.28 0-.56-.08-.83-.06-.24-.16-.46-.29-.67-.12-.2-.26-.39-.42-.56-.14-.15-.3-.28-.47-.4-.16-.11-.33-.2-.51-.27-.18-.06-.36-.1-.55-.11-.19-.01-.38.02-.56.07-.17.05-.34.13-.49.23-.15.1-.28.22-.4.36-.1.12-.19.25-.26.39-.07.13-.12.27-.15.42-.04.15-.05.31-.03.46.01.15.04.3.09.44.05.14.11.27.19.39.08.12.17.23.27.33.08.08.16.16.24.24.07.08.14.16.2.25.05.09.09.18.12.28.03.1.05.2.04.3-.01.1-.03.2-.07.29z"/>
        </svg>
      ),
      color: 'hover:text-[#25D366]'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@infinityfashion',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      color: 'hover:text-[#000000]'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/infinityfashion',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.66-.35-1.02.22-1.61.15-.15 2.81-2.58 2.86-2.8.01-.03.02-.13-.05-.18-.07-.05-.17-.03-.24-.01-.1.02-1.68 1.07-4.75 3.14-.45.31-.86.46-1.22.45-.4-.01-1.17-.23-1.74-.42-.7-.23-1.25-.35-1.2-.74.03-.2.3-.41.83-.63 3.28-1.43 5.47-2.37 6.57-2.82 3.13-1.28 3.78-1.5 4.2-1.51.09 0 .3.02.44.14.11.1.14.24.16.37.01.1.01.2-.01.31z"/>
        </svg>
      ),
      color: 'hover:text-[#26A5E4]'
    }
  ];

  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 text-gradient-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SBG</span>
              </div>
              <div>
                <span className="text-green font-bold text-lg">Style</span>
                <span className="text-orange font-bold text-lg"> Badge</span>
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
              <li><Link to="/" className="text-gray-400 hover:text-orange transition text-sm">Home</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-orange transition text-sm">Products</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-orange transition text-sm">Cart</Link></li>
              <li><Link to="/track-order" className="text-gray-400 hover:text-orange transition text-sm">Track Order</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-orange">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>+251 941211242</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>✉️</span>
                <span>info@stylebadgetex.com</span>
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
              <li>Monday - Saturday: 8AM - 6PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
          
          {/* Social Media - Separate Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-orange">Follow Us</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Stay connected for updates and offers
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Style Badge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;