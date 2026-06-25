import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  Package, 
  ShoppingCart, 
  Sparkles, 
  Truck, 
  Search, 
  Plus,
  Minus,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import ScrollReveal from '../../../components/common/ScrollReveal';
import StaggerReveal from '../../../components/common/StaggerReveal';
import { companyTrustData } from '../../../components/constants/productSectionData';


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
  description: string;
  image_url: string | null;
  product_count: number;
}

interface ServiceType {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
}

type ExpandedCategoriesState = Record<number, boolean>;
type SubCategoriesCache = Record<number, SubCategory[]>;

const ProductsIndex: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [loadingSubCategories, setLoadingSubCategories] = useState<number | null>(null);
  const [subCategoriesCache, setSubCategoriesCache] = useState<SubCategoriesCache>({});
  const [isShopByOpen, setIsShopByOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name_asc');
  
  const shopByRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (serviceTypes.length > 0) {
      fetchCategories();
    }
  }, [selectedService, debouncedSearch, serviceTypes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopByRef.current && !shopByRef.current.contains(event.target as Node)) {
        setIsShopByOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const response = await apiClient.get('/service-types/service-types');
      if (response.success && response.data) {
        setServiceTypes(response.data as ServiceType[]);
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/categories/index', {
        service_type: selectedService === 'all' ? undefined : selectedService,
        search: debouncedSearch || undefined
      });
      if (response.success && response.data) {
        setCategories(response.data as Category[]);
        setFilteredCategories(response.data as Category[]);
        setSubCategoriesCache({});
        // Scroll to top after data loads
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId: number, categorySlug: string) => {
    if (subCategoriesCache[categoryId]) {
      return;
    }

    setLoadingSubCategories(categoryId);
    try {
      const response = await apiClient.get(`/categories/detail?slug=${categorySlug}`);
      if (response.success && response.data) {
        const data = response.data as { category: Category; sub_categories: SubCategory[] };
        setSubCategoriesCache(prev => ({
          ...prev,
          [categoryId]: data.sub_categories || []
        }));
        
        setFilteredCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === categoryId 
              ? { ...cat, sub_categories: data.sub_categories || [] }
              : cat
          )
        );
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoadingSubCategories(null);
    }
  };

  const toggleCategory = (categoryId: number, categorySlug: string) => {
    const isExpanding = expandedCategoryId !== categoryId;
    
    setExpandedCategoryId(isExpanding ? categoryId : null);
    
    if (isExpanding && !subCategoriesCache[categoryId]) {
      fetchSubCategories(categoryId, categorySlug);
    }
  };

  const toggleShopBy = () => {
    setIsShopByOpen(!isShopByOpen);
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

  const getSelectedServiceDisplay = () => {
    if (selectedService === 'all') {
      return 'All Products';
    }
    const found = serviceTypes.find(st => st.name === selectedService);
    return found ? found.display_name : 'All Products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Scroll Reveal */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="flex flex-col justify-center items-center mt-20">
          <div className="container mt-8 mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* ⬇️ UPDATED: Hero Heading with Sora + Gradient ⬇️ */}
            <h1 className="heading-xl text-green mb-2">
              Our Products
            </h1>
            {/* ⬇️ UPDATED: Body text with Inter ⬇️ */}
            <p className="text-body text-charcoal max-w-2xl mx-auto">
              Browse our collection of premium custom printed products
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Section - Scroll Reveal with slight delay */}
          <ScrollReveal direction="right" delay={0.2} className="hidden lg:block lg:w-80 flex-shrink-0">
            {/* Shop By */}
            <div className="mb-2" ref={shopByRef}>
              <div className="flex items-center justify-between px-4">
                {/* ⬇️ UPDATED: Shop By Title with Sora ⬇️ */}
                <span className="heading-smd text-royal-blue-dark">{getSelectedServiceDisplay()}</span>
                <div className="relative">
                  <button
                    onClick={toggleShopBy}
                    className="flex items-center gap-1 text-royal-blue hover:text-royal-blue hover:font-bold cursor-pointer transition-colors"
                  >
                    {/* ⬇️ UPDATED: Using text-cta-sm for consistency ⬇️ */}
                    <span className="text-cta-sm text-royal-blue">Shop By</span>
                    {isShopByOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {isShopByOpen && (
                    <div 
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slide-down z-50"
                      style={{ 
                        minWidth: '200px',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedService('all');
                          setIsShopByOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          selectedService === 'all'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>All Products</span>
                        {selectedService === 'all' && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </button>
                      
                      {serviceTypes.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service.name);
                            setIsShopByOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            selectedService === service.name
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{service.display_name}</span>
                          {selectedService === service.name && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Container */}
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              {/* Categories Section */}
              <div>
                <div className="space-y-2">
                  {sortedCategories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleCategoryClick(category.slug)}
                          className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600 py-2 px-1 rounded transition-colors font-medium"
                        >
                          {category.display_name}
                          <span className="text-xs text-gray-400 ml-1">({category.product_count})</span>
                        </button>
                        <button
                          onClick={() => toggleCategory(category.id, category.slug)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
                          aria-label={expandedCategoryId === category.id ? 'Collapse' : 'Expand'}
                          disabled={loadingSubCategories === category.id}
                        >
                          {loadingSubCategories === category.id ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : expandedCategoryId === category.id ? (
                            <Minus className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Plus className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      </div>
                      
                      {/* Subcategories with smooth animation */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          expandedCategoryId === category.id 
                            ? 'grid-rows-[1fr] opacity-100 mt-1' 
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-4 border-l-2 border-gray-200 pl-3 space-y-1">
                            {expandedCategoryId === category.id && (
                              <>
                                {loadingSubCategories === category.id ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                  </div>
                                ) : subCategoriesCache[category.id] && subCategoriesCache[category.id].length > 0 ? (
                                  subCategoriesCache[category.id].map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => handleSubCategoryClick(category.slug, sub.slug)}
                                      className="block text-xs text-gray-500 hover:text-blue-600 py-1.5 w-full text-left transition-colors"
                                    >
                                      {sub.display_name}
                                      <span className="text-xs text-gray-400 ml-1">({sub.product_count})</span>
                                    </button>
                                  ))
                                ) : subCategoriesCache[category.id] && subCategoriesCache[category.id].length === 0 ? (
                                  <div className="text-xs text-gray-400 py-2">No sub-categories available</div>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Main Content - Scroll Reveal with delay */}
          <ScrollReveal direction="left" delay={0.1} className="flex-1">
            {/* Results Info with Search in between */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* ⬇️ UPDATED: Results info with Inter ⬇️ */}
                <p className="text-cta-sm text-royal-blue-dark whitespace-nowrap">
                  Showing <span className='text-royal-blue-dark'>{sortedCategories.length} categories</span>
                </p>
                
                {/* Search Input */}
                <div className="flex-1 relative min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-green-100 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
                
                <div className="flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-sm"
                  >
                    <option value="name_asc">Sort: A to Z</option>
                    <option value="name_desc">Sort: Z to A</option>
                    <option value="product_count_desc">Most Products</option>
                    <option value="product_count_asc">Least Products</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Categories Grid with Stagger Reveal */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
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
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <StaggerReveal 
                direction="up" 
                staggerDelay={0.08}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5"
              >
                {sortedCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </StaggerReveal>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* Company Data */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            {/* ⬇️ UPDATED: Section title with Sora ⬇️ */}
            <h2 className="heading-lg text-orange mb-2">
              Why Shop  <span className="text-royal-blue-dark">With Us</span>
            </h2>
            {/* ⬇️ UPDATED: Subtitle with Inter ⬇️ */}
            <p className="text-body text-gray-500 max-w-2xl mx-auto">
              Quality products, reliable service, and customer satisfaction guaranteed
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companyTrustData.map((item, index) => (
              <div key={index} className="bg-white hover-lift rounded-xl shadow-sm p-6 text-center hover:shadow-lg hover:cursor transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 bg-green/20 rounded-full flex items-center justify-center text-royal-blue">
                  {item.icon}
                </div>
                {/* ⬇️ UPDATED: Trust item title with Sora ⬇️ */}
                <h3 className="heading-sm text-royal-blue mb-2">{item.title}</h3>
                {/* ⬇️ UPDATED: Trust item description with Inter ⬇️ */}
                <p className="text-body-sm text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

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
              {/* Shop By - Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop By</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedService('all');
                      setShowMobileFilters(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                      selectedService === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>All Products</span>
                    {selectedService === 'all' && (
                      <span className="text-white">✓</span>
                    )}
                  </button>
                  
                  {serviceTypes.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service.name);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                        selectedService === service.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span>{service.display_name}</span>
                      {selectedService === service.name && (
                        <span className="text-white">✓</span>
                      )}
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
                  className="w-full px-3 py-2"
                >
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="product_count_desc">Most Products</option>
                  <option value="product_count_asc">Least Products</option>
                </select>
              </div>
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
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
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
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            <div className="absolute inset-0 rounded-lg" />
            
            <div className="absolute top-2 right-2 bg-orange/90 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-md">
              {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
        <div className="p-2.5 pt-2">
          {/* ⬇️ UPDATED: Category name with Sora ⬇️ */}
          <h3 className="heading-sm text-green mb-0.5 line-clamp-1 text-center group-hover:text-orange transition-colors">
            {category.display_name}
          </h3>
          {/* ⬇️ UPDATED: Service types with Inter (small) ⬇️ */}
          <p className="text-body-sm text-blue-600 line-clamp-1 text-center">
            {category.service_types.map(service => service.charAt(0).toUpperCase() + service.slice(1)).join(', ')}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductsIndex;