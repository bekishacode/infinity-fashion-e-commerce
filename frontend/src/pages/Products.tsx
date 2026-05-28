import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService, Product } from '../services/productService';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<'all' | 'wholesale' | 'retail' | 'pod'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [error, setError] = useState<string | null>(null);

  const serviceTypes = [
    { value: 'all', label: 'All Products', icon: '', color: 'bg-gray-100' },
    { value: 'pod', label: 'Print on Demand', icon: '', color: 'bg-magenta' },
    { value: 'retail', label: 'Retail', icon: '', color: 'bg-green' },
    { value: 'wholesale', label: 'Wholesale', icon: '', color: 'bg-royal-blue' },
    
  ];

  const getSubCategories = () => {
    const allCategories = {
      retail: [
        { value: 'all', label: 'All Retail', icon: '' },
        { value: 't-shirts', label: 'T-Shirts', icon: '' },
        { value: 'caps', label: 'Caps', icon: '' },
        { value: 'bags', label: 'Bags', icon: '' },
        { value: 'hoodies', label: 'Hoodies', icon: '' },
      ],
      wholesale: [
        { value: 'all', label: 'All Wholesale', icon: '' },
        { value: 't-shirts', label: 'Bulk T-Shirts', icon: '' },
        { value: 'caps', label: 'Bulk Caps', icon: '' },
        { value: 'uniforms', label: 'Work Wear/Uniforms', icon: '' },
      ],
      pod: [
        { value: 'all', label: 'All POD', icon: '' },
        { value: 't-shirts', label: 'Custom T-Shirts', icon: '' },
        { value: 'hoodies', label: 'Custom Hoodies', icon: '' },
        { value: 'gifts', label: 'Gift Items', icon: '' },
      ],
    };
    return selectedService === 'all' 
      ? allCategories.retail 
      : allCategories[selectedService as keyof typeof allCategories] || allCategories.retail;
  };

  // Fetch products function - will be called whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      
      if (selectedService !== 'all') {
        filters.service = selectedService;
      }
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      filters.min_price = priceRange[0];
      filters.max_price = priceRange[1];
      filters.sort = sortBy;
      
      console.log('Fetching products with filters:', filters);
      
      const response = await productService.getProducts(filters);
      console.log('API Response:', response);
      
      setProducts(response.data);
      if (response.data.length > 0) {
        const max = Math.max(...response.data.map((p: Product) => p.price));
        setMaxPrice(max);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedService, selectedCategory, searchTerm, sortBy, priceRange[0], priceRange[1]]);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle service change - this will trigger the useEffect above
  const handleServiceChange = (service: 'all' | 'wholesale' | 'retail' | 'pod') => {
    setSelectedService(service);
    setSelectedCategory('all'); // Reset category when service changes
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedService('all');
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('featured');
    setPriceRange([0, maxPrice]);
  };

  const subCategories = getSubCategories();

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="bg-royal-blue text-white px-6 py-2 rounded-lg hover:bg-royal-blue-dark transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${
        selectedService === 'wholesale' ? 'from-royal-blue to-royal-blue-dark' :
        selectedService === 'pod' ? 'from-magenta to-magenta-dark' :
        'from-royal-blue to-magenta'
      } py-12 md:py-16 transition-all duration-500`}>
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {selectedService === 'wholesale' ? 'Wholesale Collection' :
             selectedService === 'pod' ? 'Print on Demand' :
             'Our Collection'}
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
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
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {serviceTypes.map(service => (
                <button
                  key={service.value}
                  onClick={() => handleServiceChange(service.value as any)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedService === service.value
                      ? `${service.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{service.icon}</span>
                  <span >{service.label}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 bg-gray-100 px-4 py-2 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </button>
            
            <div className="flex gap-3">
              <select
                className="input w-40"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              
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
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t lg:hidden">
              <div className="mb-4">
                <label className="label mb-2">Sub-Category</label>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
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
            </div>
          )}
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-32">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-charcoal">Sub-Categories</h3>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className="text-xs text-royal-blue hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2 mb-6">
                {subCategories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
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
              
              {(selectedService !== 'all' || selectedCategory !== 'all' || searchTerm || sortBy !== 'featured') && (
                <button
                  onClick={clearAllFilters}
                  className="mt-6 w-full text-center text-sm text-royal-blue hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <div className="text-gray-600">
                Found {products.length} products
              </div>
              {loading && (
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-royal-blue"></div>
              )}
            </div>
            
            {products.length === 0 && !loading ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-charcoal text-lg">No products found.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-royal-blue hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <div className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer">
                      <div className="relative">
                        <div className="text-7xl py-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                          {product.icon}
                        </div>
                        {product.badge && (
                          <span className={`absolute top-3 right-3 ${product.badgeColor} text-white text-xs px-2 py-1 rounded-full`}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 text-charcoal group-hover:text-royal-blue transition">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <p className="text-royal-blue font-bold text-xl">ETB {product.price}</p>
                          {product.originalPrice && (
                            <p className="text-gray-400 line-through text-sm">ETB {product.originalPrice}</p>
                          )}
                        </div>
                        <button className="w-full bg-gradient-to-r from-royal-blue to-magenta text-white py-2 rounded-lg hover:shadow-lg transition">
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
                {products.map((product) => (
                  <Link to={`/product/${product.id}`} key={product.id}>
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 flex gap-4 items-center">
                      <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                        {product.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-charcoal">{product.name}</h3>
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