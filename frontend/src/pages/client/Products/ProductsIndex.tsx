import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  Package, 
  ShoppingCart, 
  Sparkles, 
  Truck, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Minus,
  Filter,
  X
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  image_url: string | null;
  product_count: number;
  service_types: string[];
  sub_categories?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  product_count: number;
}

interface ServiceType {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
}

const ProductsIndex: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name_asc');

  const serviceTypes: ServiceType[] = [
    { id: 'all', name: 'All Products', icon: <Package className="w-4 h-4" />, color: 'bg-gray-500' },
    { id: 'retail', name: 'Retail', icon: <ShoppingCart className="w-4 h-4" />, color: 'bg-blue-500' },
    { id: 'wholesale', name: 'Wholesale', icon: <Truck className="w-4 h-4" />, color: 'bg-green-500' },
    { id: 'pod', name: 'Print on Demand', icon: <Sparkles className="w-4 h-4" />, color: 'bg-purple-500' }
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [selectedService, debouncedSearch]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/categories/index.php', {
        service_type: selectedService === 'all' ? undefined : selectedService,
        search: debouncedSearch || undefined
      });
      if (response.success && response.data) {
        setCategories(response.data as Category[]);
        setFilteredCategories(response.data as Category[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/products/category/${categorySlug}`);
  };

  const handleSubCategoryClick = (categorySlug: string, subCategorySlug: string) => {
    navigate(`/products/category/${categorySlug}/${subCategorySlug}`);
  };

  const clearFilters = () => {
    setSelectedService('all');
    setSearchQuery('');
    setSortBy('name_asc');
  };

  // Sort categories
  const getSortedCategories = () => {
    const sorted = [...filteredCategories];
    switch (sortBy) {
      case 'name_asc':
        return sorted.sort((a, b) => a.display_name.localeCompare(b.display_name));
      case 'name_desc':
        return sorted.sort((a, b) => b.display_name.localeCompare(a.display_name));
      case 'product_count_asc':
        return sorted.sort((a, b) => a.product_count - b.product_count);
      case 'product_count_desc':
        return sorted.sort((a, b) => b.product_count - a.product_count);
      default:
        return sorted;
    }
  };

  const sortedCategories = getSortedCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-royal-blue to-magenta text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-white/80">Browse our collection of premium custom printed products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue text-sm"
                  />
                </div>
              </div>

              {/* Service Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <div className="space-y-2">
                  {serviceTypes.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedService === service.id
                          ? `${service.color} text-white`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {service.icon}
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue text-sm"
                >
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="product_count_desc">Most Products</option>
                  <option value="product_count_asc">Least Products</option>
                </select>
              </div>

              {/* Categories Tree */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sortedCategories.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleCategoryClick(category.slug)}
                          className="flex-1 text-left text-sm text-gray-700 hover:text-royal-blue py-1"
                        >
                          {category.display_name}
                          <span className="text-xs text-gray-400 ml-1">({category.product_count})</span>
                        </button>
                        {category.sub_categories && category.sub_categories.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedCategories.has(category.id) ? (
                              <Minus className="w-3 h-3" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      {expandedCategories.has(category.id) && category.sub_categories && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                          {category.sub_categories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubCategoryClick(category.slug, sub.slug)}
                              className="block text-xs text-gray-500 hover:text-royal-blue py-1 w-full text-left"
                            >
                              {sub.display_name}
                              <span className="text-xs text-gray-400 ml-1">({sub.product_count})</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full text-center text-sm text-royal-blue hover:underline py-2"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button and Top Bar */}
            <div className="lg:hidden mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Showing {sortedCategories.length} categories
              </p>
              <div className="hidden lg:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue text-sm bg-white"
                >
                  <option value="name_asc">Sort: A to Z</option>
                  <option value="name_desc">Sort: Z to A</option>
                  <option value="product_count_desc">Sort: Most Products</option>
                  <option value="product_count_asc">Sort: Least Products</option>
                </select>
              </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="aspect-[1/1] bg-gray-200 rounded-t-xl"></div>
                    <div className="p-2.5 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedCategories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-royal-blue hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
                {sortedCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end lg:hidden">
          <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <div className="space-y-2">
                  {serviceTypes.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service.id);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedService === service.id
                          ? `${service.color} text-white`
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {service.icon}
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="product_count_desc">Most Products</option>
                  <option value="product_count_asc">Least Products</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full text-center text-royal-blue hover:underline py-2"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const CategoryCard: React.FC<{
  category: Category;
}> = ({ category }) => {
  return (
    <Link 
      to={`/products/category/${category.slug}`}
      className="block group"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
        <div className="p-2.5 pb-0">
          <div className="relative aspect-[1/1] overflow-hidden border border-[#fccde0] rounded-lg">
            <img
              src={getImageUrl(category.image_url) || '/api/placeholder/400/400'}
              alt={category.display_name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-lg" />
            
            {/* Product count badge - TOP RIGHT CORNER */}
            <div className="absolute top-2 right-2 bg-orange/90 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-md">
              {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
        <div className="p-2.5 pt-2">
          <h3 className="font-medium text-green text-sm sm:text-base mb-0.5 line-clamp-1 text-center">
            {category.display_name}
          </h3>
          <p className="text-[11px] text-royal-blue line-clamp-1 text-center">
            {category.service_types.map(service => service.charAt(0).toUpperCase() + service.slice(1)).join(', ')}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductsIndex;