import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  icon: string;
  serviceType: 'wholesale' | 'retail' | 'pod';
  category: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  minQuantity?: number;
}

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<'all' | 'wholesale' | 'retail' | 'pod'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  const products: Product[] = [
    // RETAIL Products
    { id: 1, name: 'Custom T-Shirt', price: 350, icon: '👕', serviceType: 'retail', category: 't-shirts', badge: 'Best Seller', badgeColor: 'bg-orange', rating: 4.8, reviewCount: 124, originalPrice: 450 },
    { id: 2, name: 'Personalized Cap', price: 250, icon: '🧢', serviceType: 'retail', category: 'caps', badge: 'Trending', badgeColor: 'bg-green', rating: 4.6, reviewCount: 89, originalPrice: 300 },
    { id: 5, name: 'Polo T-Shirt', price: 400, icon: '👕', serviceType: 'retail', category: 't-shirts', rating: 4.5, reviewCount: 67 },
    { id: 7, name: 'Tote Bag', price: 380, icon: '👜', serviceType: 'retail', category: 'bags', rating: 4.6, reviewCount: 78 },
    { id: 10, name: 'Wool Cap', price: 320, icon: '🧢', serviceType: 'retail', category: 'caps', rating: 4.5, reviewCount: 34 },
    
    // WHOLESALE Products
    { id: 3, name: 'Bulk Custom T-Shirts', price: 220, icon: '👕', serviceType: 'wholesale', category: 't-shirts', badge: 'Bulk Order', badgeColor: 'bg-royal-blue', minQuantity: 50, originalPrice: 350 },
    { id: 6, name: 'Bulk Sports Cap', price: 180, icon: '🧢', serviceType: 'wholesale', category: 'caps', badge: 'Limited', badgeColor: 'bg-orange', minQuantity: 100 },
    { id: 11, name: 'Corporate Uniform Set', price: 1200, icon: '👔', serviceType: 'wholesale', category: 'uniforms', badge: 'Corporate', badgeColor: 'bg-royal-blue', minQuantity: 20 },
    { id: 15, name: 'Bulk Polo Shirts', price: 280, icon: '👕', serviceType: 'wholesale', category: 't-shirts', minQuantity: 50, originalPrice: 400 },
    { id: 16, name: 'Work Wear Jacket', price: 850, icon: '🧥', serviceType: 'wholesale', category: 'uniforms', minQuantity: 30 },
    
    // PRINT ON DEMAND Products
    { id: 4, name: 'Custom Hoodie (POD)', price: 650, icon: '👔', serviceType: 'pod', category: 'hoodies', badge: 'Design Now', badgeColor: 'bg-magenta', rating: 4.9, reviewCount: 203, originalPrice: 750 },
    { id: 9, name: 'Custom T-Shirt (POD)', price: 420, icon: '👕', serviceType: 'pod', category: 't-shirts', badge: 'Print on Demand', badgeColor: 'bg-royal-blue', rating: 4.9, reviewCount: 45 },
    { id: 12, name: 'Custom Mug (POD)', price: 250, icon: '☕', serviceType: 'pod', category: 'gifts', rating: 4.8, reviewCount: 92 },
    { id: 13, name: 'Custom Phone Case (POD)', price: 350, icon: '📱', serviceType: 'pod', category: 'gifts', badge: 'New', badgeColor: 'bg-green', rating: 4.7, reviewCount: 56 },
    { id: 14, name: 'Custom Poster (POD)', price: 180, icon: '🖼️', serviceType: 'pod', category: 'paper', rating: 4.6, reviewCount: 34 },
  ];

  const serviceTypes = [
    { value: 'all', label: 'All Products', icon: '📦', color: 'bg-gray-100' },
    { value: 'retail', label: 'Retail', icon: '🛍️', color: 'bg-green', description: 'Single item purchases' },
    { value: 'wholesale', label: 'Wholesale', icon: '🏭', color: 'bg-royal-blue', description: 'Bulk orders 50+' },
    { value: 'pod', label: 'Print on Demand', icon: '🎨', color: 'bg-magenta', description: 'Custom designs' },
  ];

  // Sub-categories based on selected service type
  const getSubCategories = () => {
    const allCategories = {
      retail: [
        { value: 'all', label: 'All Retail', icon: '🛍️' },
        { value: 't-shirts', label: 'T-Shirts', icon: '👕' },
        { value: 'caps', label: 'Caps', icon: '🧢' },
        { value: 'bags', label: 'Bags', icon: '👜' },
        { value: 'hoodies', label: 'Hoodies', icon: '👔' },
      ],
      wholesale: [
        { value: 'all', label: 'All Wholesale', icon: '🏭' },
        { value: 't-shirts', label: 'Bulk T-Shirts', icon: '👕' },
        { value: 'caps', label: 'Bulk Caps', icon: '🧢' },
        { value: 'uniforms', label: 'Work Wear/Uniforms', icon: '👔' },
      ],
      pod: [
        { value: 'all', label: 'All POD', icon: '🎨' },
        { value: 't-shirts', label: 'Custom T-Shirts', icon: '👕' },
        { value: 'hoodies', label: 'Custom Hoodies', icon: '👔' },
        { value: 'gifts', label: 'Gift Items', icon: '🎁' },
        { value: 'paper', label: 'Paper Printing', icon: '📄' },
      ],
    };
    return selectedService === 'all' 
      ? allCategories.retail 
      : allCategories[selectedService as keyof typeof allCategories] || allCategories.retail;
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || product.serviceType === selectedService;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesService && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      default:
        return a.id - b.id;
    }
  });

  const maxPrice = Math.max(...products.map(p => p.price));

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const subCategories = getSubCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Dynamic based on service */}
      <div className={`bg-gradient-to-r ${
        selectedService === 'wholesale' ? 'from-royal-blue to-royal-blue-dark' :
        selectedService === 'pod' ? 'from-magenta to-magenta-dark' :
        'from-royal-blue to-magenta'
      } py-12 md:py-16 transition-all duration-500`}>
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
            {selectedService === 'wholesale' ? 'Wholesale Collection' :
             selectedService === 'pod' ? 'Print on Demand' :
             'Our Collection'}
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto animate-slide-up">
            {selectedService === 'wholesale' ? 'Bulk orders with special pricing. Minimum 50 pieces.' :
             selectedService === 'pod' ? 'Upload your design. We print and ship. No minimum order.' :
             'Discover high-quality custom printed products for every occasion.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 sticky top-20 z-30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Service Type Tabs - Primary filter */}
            <div className="flex gap-2">
              {serviceTypes.map(service => (
                <button
                  key={service.value}
                  onClick={() => {
                    setSelectedService(service.value as any);
                    setSelectedCategory('all');
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedService === service.value
                      ? `${service.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{service.icon}</span>
                  <span className="hidden sm:inline">{service.label}</span>
                </button>
              ))}
            </div>
            
            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters & Sort
            </button>
            
            {/* Sort and View Options */}
            <div className="flex gap-3">
              <select
                className="input w-40"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              
              {/* View Toggle */}
              <div className="hidden md:flex gap-2 border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-royal-blue text-white' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-royal-blue text-white' : 'text-gray-400'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t lg:hidden">
              <div className="mb-4">
                <label className="label mb-2">Sub-Category</label>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedCategory === cat.value
                          ? 'bg-royal-blue text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label mb-2">Price Range</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm">ETB {priceRange[0]}</span>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm">ETB {priceRange[1]}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
              <h3 className="font-bold text-lg mb-4 text-charcoal">Sub-Categories</h3>
              <div className="space-y-2 mb-6">
                {subCategories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      selectedCategory === cat.value
                        ? 'bg-royal-blue/10 text-royal-blue font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {selectedCategory === cat.value && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              
              <h3 className="font-bold text-lg mb-4 text-charcoal">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ETB {priceRange[0]}</span>
                  <span>ETB {priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 text-gray-600">
              Found {sortedProducts.length} products
            </div>
            
            {/* Products Grid/List */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-charcoal text-lg">No products found.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedService('all');
                    setSelectedCategory('all');
                    setPriceRange([0, maxPrice]);
                  }}
                  className="mt-4 text-royal-blue hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer">
                      <div className="relative">
                        <div className="text-7xl py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-royal-blue/5 group-hover:to-magenta/5 transition">
                          {product.icon}
                        </div>
                        {product.badge && (
                          <span className={`absolute top-3 right-3 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                            {product.badge}
                          </span>
                        )}
                        {product.minQuantity && (
                          <span className="absolute top-3 left-3 bg-royal-blue text-white text-xs px-2 py-1 rounded-full">
                            Min {product.minQuantity} pcs
                          </span>
                        )}
                        {product.originalPrice && !product.minQuantity && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(Math.floor(product.rating || 0))}
                            {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 text-charcoal group-hover:text-royal-blue transition">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-royal-blue font-bold text-xl">ETB {product.price}</p>
                          {product.originalPrice && (
                            <p className="text-gray-400 line-through text-sm">ETB {product.originalPrice}</p>
                          )}
                        </div>
                        <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105">
                          {product.serviceType === 'wholesale' ? 'Request Quote' : 
                           product.serviceType === 'pod' ? 'Customize Now' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex gap-4 items-center">
                      <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        {product.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-charcoal">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-yellow-400 text-sm">
                            {'★'.repeat(Math.floor(product.rating || 0))}
                          </div>
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                        {product.minQuantity && (
                          <p className="text-xs text-royal-blue mt-1">Min order: {product.minQuantity} pieces</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-royal-blue font-bold text-xl">ETB {product.price}</p>
                        <button className="mt-2 bg-gradient-to-r from-royal-blue to-magenta text-white px-4 py-1 rounded-lg text-sm hover:shadow-lg transition">
                          {product.serviceType === 'wholesale' ? 'Request Quote' : 
                           product.serviceType === 'pod' ? 'Customize' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;