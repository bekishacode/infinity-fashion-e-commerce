import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService, Product } from '../../services/productService';
import ProductCarousel from '../../components/common/ProductCarousel';

const Products: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<'all' | 'wholesale' | 'retail' | 'pod'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilterMinimized, setIsFilterMinimized] = useState(false);

  const serviceTypes = [
    { value: 'all', label: 'All Products', icon: '', color: 'bg-gray-100', textColor: 'text-gray-700' },
    { value: 'pod', label: 'Print on Demand', icon: '', color: 'bg-magenta', textColor: 'text-white' },
    { value: 'retail', label: 'Retail', icon: '', color: 'bg-green', textColor: 'text-white' },
    { value: 'wholesale', label: 'Wholesale', icon: '', color: 'bg-royal-blue', textColor: 'text-white' },
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

  const groupProductsByType = (products: Product[]) => {
    return {
      retail: products.filter(p => p.service_type === 'retail'),
      wholesale: products.filter(p => p.service_type === 'wholesale'),
      pod: products.filter(p => p.service_type === 'pod'),
    };
  };

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
      filters.sort = sortBy;
      
      const response = await productService.getProducts(filters);
      
      // response now has { products: [...], pagination: {...} }
      const productsList = response.products || [];
      setAllProducts(productsList);
      setFilteredProducts(productsList);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedService, selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleServiceChange = (service: 'all' | 'wholesale' | 'retail' | 'pod') => {
    setSelectedService(service);
    setSelectedCategory('all');
    setMobileFiltersOpen(false);
    // Minimize filter on mobile after selection
    if (window.innerWidth < 1024) {
      setIsFilterMinimized(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Minimize filter on mobile after selection
    if (window.innerWidth < 1024) {
      setIsFilterMinimized(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const clearAllFilters = () => {
    setSelectedService('all');
    setSelectedCategory('all');
    setSearchTerm('');
    setSortBy('featured');
    // Keep filter minimized on mobile after clearing
    if (window.innerWidth < 1024) {
      setIsFilterMinimized(true);
    }
  };

  const toggleFilterMinimized = () => {
    setIsFilterMinimized(!isFilterMinimized);
  };

  // Render content based on selected service and view mode
  const renderContent = () => {
    if (viewMode === 'list') {
      // List view - show all products in a list
      return (
        <div className="space-y-3 sm:space-y-4">
          {filteredProducts.slice(0, 12).map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="text-4xl sm:text-5xl w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex-shrink-0">
                  {product.icon}
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-sm sm:text-base md:text-lg text-charcoal">{product.name}</h3>
                  {product.min_quantity && (
                    <p className="text-xs text-royal-blue mt-1">Min order: {product.min_quantity} pieces</p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className="text-royal-blue font-bold text-base sm:text-lg md:text-xl">ETB {product.price}</p>
                  <button className="mt-2 bg-gradient-to-r from-royal-blue to-magenta text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm hover:shadow-lg transition w-full sm:w-auto">
                    {product.service_type === 'wholesale' ? 'Request Quote' : 
                     product.service_type === 'pod' ? 'Customize' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    // Grid view with carousel for ALL cases
    if (selectedService === 'all') {
      const grouped = groupProductsByType(filteredProducts);
      return (
        <>
          {grouped.pod.length > 0 && (
            <ProductCarousel 
              title="Print on Demand" 
              icon="" 
              products={grouped.pod} 
              bgColor=""
              onViewAll={() => {
                setSelectedService('pod');
                setSelectedCategory('all');
                if (window.innerWidth < 1024) {
                  setIsFilterMinimized(true);
                }
              }}
            />
          )}
          {grouped.retail.length > 0 && (
            <ProductCarousel 
              title="Retail" 
              icon="" 
              products={grouped.retail} 
              bgColor=""
              onViewAll={() => {
                setSelectedService('retail');
                setSelectedCategory('all');
                if (window.innerWidth < 1024) {
                  setIsFilterMinimized(true);
                }
              }}
            />
          )}
          {grouped.wholesale.length > 0 && (
            <ProductCarousel 
              title="Wholesale" 
              icon="" 
              products={grouped.wholesale} 
              bgColor=""
              onViewAll={() => {
                setSelectedService('wholesale');
                setSelectedCategory('all');
                if (window.innerWidth < 1024) {
                  setIsFilterMinimized(true);
                }
              }}
            />
          )}
        </>
      );
    } else {
      // Single service type - Use carousel for specific type
      const serviceMap = {
        pod: { title: 'Print on Demand', icon: '', bgColor: '' },
        retail: { title: 'Retail', icon: '', bgColor: '' },
        wholesale: { title: 'Wholesale', icon: '', bgColor: '' }
      };
      const config = serviceMap[selectedService];
      
      return (
        <ProductCarousel 
          title={config.title} 
          icon={config.icon} 
          products={filteredProducts} 
          bgColor={config.bgColor}
          onViewAll={() => {
            // Already viewing this type, so just scroll to top or do nothing
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }
  };

  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && allProducts.length === 0) {
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

  const subCategories = getSubCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Reduced padding */}
      <div className={`bg-gradient-to-r ${
        selectedService === 'wholesale' ? 'from-royal-blue to-royal-blue-dark' :
        selectedService === 'pod' ? 'from-magenta to-magenta-dark' :
        selectedService === 'retail' ? 'from-green to-green-dark' :
        'from-royal-blue to-magenta'
      } py-6 sm:py-8 md:py-12 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center text-white">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            {selectedService === 'wholesale' ? 'Wholesale Collection' :
             selectedService === 'pod' ? 'Print on Demand' :
             selectedService === 'retail' ? 'Retail Collection' :
             'Our Collection'}
          </h1>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto">
            {selectedService === 'wholesale' ? 'Bulk orders with special pricing. Minimum 50 pieces.' :
             selectedService === 'pod' ? 'Upload your design. We print and ship. No minimum order.' :
             selectedService === 'retail' ? 'High-quality products for personal use and gifts.' :
             'Discover high-quality custom printed products for every occasion.'}
          </p>
        </div>
      </div>

      {/* Main content - Removed padding, using max-w-7xl for better centering */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Search and Filter Bar - Responsive for mobile */}
        <div className="bg-royal-blue rounded-xl shadow-md mb-4 sm:mb-6 sticky top-20 z-30">
          {/* Minimized filter bar for mobile */}
          {isFilterMinimized && window.innerWidth < 1024 && (
            <div className="p-2 sm:p-3 flex items-center justify-between cursor-pointer" onClick={toggleFilterMinimized}>
              <div className="flex items-center gap-2">
                <span className="text-royal-blue font-semibold text-xs sm:text-sm">Filters Applied</span>
                {(selectedService !== 'all' || selectedCategory !== 'all' || searchTerm || sortBy !== 'featured') && (
                  <span className="bg-royal-blue-dark text-white text-xs px-2 py-0.5 rounded-full">
                    {[
                      selectedService !== 'all' ? 1 : 0,
                      selectedCategory !== 'all' ? 1 : 0,
                      searchTerm ? 1 : 0,
                      sortBy !== 'featured' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                  }}
                  className="text-xs text-gray-500 hover:text-royal-blue"
                >
                  Clear all
                </button>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Full filter bar - hidden on mobile when minimized */}
          <div className={`p-2 sm:p-3 transition-all duration-300 ${
            isFilterMinimized && window.innerWidth < 1024 ? 'hidden' : 'block'
          }`}>
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-3 py-1.5 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent text-sm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div className="flex gap-1.5 flex-nowrap lg:flex-wrap overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {serviceTypes.map(service => (
                  <button
                    key={service.value}
                    onClick={() => handleServiceChange(service.value as any)}
                    className={`bg-white px-3 py-1 rounded-full font-semibold transition-all duration-300 flex items-center gap-1 whitespace-nowrap text-xs sm:text-sm ${
                      selectedService === service.value
                        ? `${service.color} ${service.textColor} shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{service.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileFiltersOpen(!mobileFiltersOpen);
                    if (mobileFiltersOpen) {
                      setIsFilterMinimized(false);
                    }
                  }}
                  className="lg:hidden flex items-center justify-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110 4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Filters
                </button>
                
                <div className="flex gap-2">
                  
                  <div className="hidden md:flex gap-1 border rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded ${viewMode === 'grid' ? 'bg-royal-blue text-white' : 'text-gray-400'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded ${viewMode === 'list' ? 'bg-royal-blue text-white' : 'text-gray-400'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {mobileFiltersOpen && (
              <div className="mt-3 pt-3 border-t lg:hidden">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Sub-Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {subCategories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          handleCategoryChange(cat.value);
                          setMobileFiltersOpen(false);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs transition ${
                          selectedCategory === cat.value
                            ? 'bg-royal-blue text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span className="mr-1">{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full bg-gray-100 text-royal-blue py-1.5 rounded-lg font-semibold text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar Filters - Only visible on large devices */}
        <div className="hidden lg:block ">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="w-56 flex-shrink-0 bg-royal-blue-dark rounded-xl shadow-md">
              <div className="p-4 sticky top-32">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-base text-white">Sub-Categories</h3>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="text-xs text-orange hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-white">
                  {subCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center gap-2 text-sm ${
                        selectedCategory === cat.value
                          ? 'bg-royal-blue/10 text-orange font-semibold'
                          : 'hover:bg-orange-dark'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                      {selectedCategory === cat.value && (
                        <svg className="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                
                {(selectedService !== 'all' || selectedCategory !== 'all' || searchTerm || sortBy !== 'featured') && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 w-full text-center text-xs text-white hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-100">
              <div className="mb-3 flex justify-between items-center">
                <div className="text-gray-600 text-sm">
                  Found {filteredProducts.length} products
                </div>
                {loading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-royal-blue"></div>
                )}
              </div>
              
              {filteredProducts.length === 0 && !loading ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="text-6xl mb-3">🔍</div>
                  <p className="text-charcoal text-base">No products found.</p>
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setIsFilterMinimized(false);
                    }}
                    className="mt-3 text-royal-blue hover:underline text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </div>
        </div>

        {/* Mobile layout - Only visible on small devices */}
        <div className="lg:hidden">
          <div className="mb-3 flex justify-between items-center">
            <div className="text-gray-600 text-sm">
              Found {filteredProducts.length} products
            </div>
            {loading && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-royal-blue"></div>
            )}
          </div>
          
          {filteredProducts.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-3">🔍</div>
              <p className="text-charcoal text-base">No products found.</p>
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsFilterMinimized(false);
                }}
                className="mt-3 text-royal-blue hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;