import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  ArrowLeft, 
  Package, 
  Truck,
  Palette,
  Clock,
  Shield,
  CheckCircle,
  Plus,
  Minus,
  Star,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import ScrollReveal from '../../../components/common/ScrollReveal';

// Import from your existing types
import { Category, SubCategory, HowToOrderStep, FAQ, PopularProduct } from '../../../types/api.types';

// Default content if no JSON data exists
const DEFAULT_CONTENT = {
  how_to_order: [
    {
      id: 1,
      icon: 'Palette',
      title: 'Choose Your Style',
      description: 'Browse through our collection and select the style that fits your needs'
    },
    {
      id: 2,
      icon: 'Truck',
      title: 'Select Size & Quantity',
      description: 'Pick your preferred size and quantity. Minimum order quantities may apply'
    },
    {
      id: 3,
      icon: 'CheckCircle',
      title: 'Customize & Review',
      description: 'Add your customizations and review your order details before checkout'
    },
    {
      id: 4,
      icon: 'Shield',
      title: 'Place Order & Track',
      description: 'Complete your purchase and track your order every step of the way'
    }
  ],
  faqs: [
    {
      id: 1,
      question: 'What materials are used for these products?',
      answer: 'All our products are made from premium quality materials. T-shirts use 100% combed cotton, hoodies are made from a cotton-polyester blend, and accessories use durable materials designed for long-lasting wear.'
    },
    {
      id: 2,
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 3-5 business days for standard shipping. Express shipping options are available for faster delivery. Custom orders may take an additional 2-3 days for production.'
    },
    {
      id: 3,
      question: 'Can I customize the products?',
      answer: 'Yes! We offer various customization options including custom printing, embroidery, and personalized designs. You can choose colors, add logos, or create unique designs for your products.'
    },
    {
      id: 4,
      question: 'What is the minimum order quantity?',
      answer: 'Minimum order quantities vary by product category. For retail products, you can order as few as 1 unit. Wholesale orders typically require a minimum of 10 units per design.'
    }
  ],
  popular_products: [
    {
      id: 1,
      name: 'Classic Cotton T-Shirt',
      price: 450,
      rating: 4.8,
      image: '/api/placeholder/80/80',
      slug: undefined
    },
    {
      id: 2,
      name: 'Premium Hoodie',
      price: 850,
      rating: 4.9,
      image: '/api/placeholder/80/80',
      slug: undefined
    },
    {
      id: 3,
      name: 'Custom Cap',
      price: 350,
      rating: 4.6,
      image: '/api/placeholder/80/80',
      slug: undefined
    }
  ],
  stats: {
    delivery_time: '3-5 Business Days',
    quality_guarantee: '100% Satisfaction',
    customer_rating: '4.8 / 5.0'
  },
  trust_badge: {
    title: 'Trusted by 500+ Customers',
    rating: '4.8/5 average rating'
  }
};

type CardSize = 'normal' | 'large';

interface GridConfig {
  cols: string;
  size: CardSize;
}

const CategoryProducts: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Use content from API or fallback to defaults
  const getContent = () => ({
    how_to_order: category?.how_to_order?.length ? category.how_to_order : DEFAULT_CONTENT.how_to_order,
    faqs: category?.faqs?.length ? category.faqs : DEFAULT_CONTENT.faqs,
    popular_products: category?.popular_products?.length ? category.popular_products : DEFAULT_CONTENT.popular_products,
    stats: category?.stats ? { ...DEFAULT_CONTENT.stats, ...category.stats } : DEFAULT_CONTENT.stats,
    trust_badge: category?.trust_badge ? { ...DEFAULT_CONTENT.trust_badge, ...category.trust_badge } : DEFAULT_CONTENT.trust_badge
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchCategoryData();
  }, [categorySlug, location.search]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/categories/detail.php?slug=${categorySlug}`);
      if (response.success && response.data) {
        const data = response.data as { category: Category; sub_categories: SubCategory[] };
        setCategory(data.category);
        setSubCategories(data.sub_categories || []);
        // Scroll to top after data loads
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'Palette': <Palette className="w-6 h-6" />,
      'Truck': <Truck className="w-6 h-6" />,
      'CheckCircle': <CheckCircle className="w-6 h-6" />,
      'Shield': <Shield className="w-6 h-6" />,
      'Package': <Package className="w-6 h-6" />,
      'Clock': <Clock className="w-6 h-6" />,
      'Award': <Award className="w-6 h-6" />,
      'Zap': <Zap className="w-6 h-6" />,
    };
    return icons[iconName] || <Package className="w-6 h-6" />;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Determine grid columns and card sizing based on number of subcategories
  const getGridConfig = (): GridConfig => {
    const count = subCategories.length;
    if (count === 0) return { cols: 'grid-cols-1', size: 'normal' };
    if (count === 1) return { cols: 'grid-cols-1', size: 'large' };
    if (count === 2) return { cols: 'grid-cols-1 sm:grid-cols-2', size: 'large' };
    if (count <= 4) return { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2', size: 'normal' };
    return { cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', size: 'normal' };
  };

  const gridConfig = getGridConfig();
  const content = category ? getContent() : DEFAULT_CONTENT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="heading-lg text-gray-800">Category not found</h2>
          <Link to="/products" className="text-royal-blue mt-4 inline-block hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Section 1: Hero Header */}
      <ScrollReveal direction="up">
        <section className="py-2 md:py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24">
            {/* Centered Content */}
            <div className="text-center">
              {/* ⬇️ UPDATED: Category title with Sora ⬇️ */}
              <h1 className="heading-xl text-orange mb-2">
                {category.display_name}
              </h1>
              {/* ⬇️ UPDATED: Description with Inter ⬇️ */}
              <p className="text-body text-gray-500 max-w-2xl mx-auto">
                {category.description || 'Explore our collection of premium custom printed products'}
              </p>
            </div>
            
            {/* Stats Labels - Center */}
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              <span className="bg-royal-blue px-3 py-1 rounded-full text-xs text-white shadow-sm">
                {subCategories.length} Sub-Categories
              </span>
              <span className="bg-green px-3 py-1 rounded-full text-xs text-white shadow-sm">
                {subCategories.reduce((acc, sub) => acc + (sub.product_count || 0), 0)} Products
              </span>
            </div>

            {/* Back Button - Below Stats, Left Aligned */}
            <div className="flex justify-start mt-3 pt-2 pb-2 border-b border-orange-100">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-royal-blue text-sm transition group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Categories
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 2: Sub-Categories Grid */}
      <ScrollReveal direction="up">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Sub Categories Grid */}
            <div className="lg:col-span-3">
              {subCategories.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="heading-md text-gray-900">No sub-categories found</h3>
                  <p className="text-body text-gray-500 mt-2">Check back soon for new products</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    {/* ⬇️ UPDATED: Section title with Sora ⬇️ */}
                    <h2 className="heading-md text-royal-blue">
                      Explore {category.display_name}
                    </h2>
                    {/* ⬇️ UPDATED: Subtitle with Inter ⬇️ */}
                    <p className="text-body-sm text-gray-500 mt-1">
                      Showing {subCategories.length} sub-categories
                    </p>
                  </div>
                  
                  <div className={`grid ${gridConfig.cols} gap-5 md:gap-6`}>
                    {subCategories.map((subCategory) => (
                      <SubCategoryCard 
                        key={subCategory.id} 
                        subCategory={subCategory} 
                        categorySlug={category.slug}
                        size={gridConfig.size}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Category Description Sidebar (1/4 width) */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-orange-100/2 p-6 sticky top-24 space-y-6">
                {/* Category Description */}
                <div>
                  {/* ⬇️ UPDATED: Sidebar title with Sora ⬇️ */}
                  <h3 className="heading-sm text-royal-blue-dark mb-3">About This Category</h3>
                  {/* ⬇️ UPDATED: Description with Inter ⬇️ */}
                  <p className="text-body-sm text-gray-600 leading-relaxed">
                    {category.description || 'Discover our premium collection of custom printed products designed for quality and style.'}
                  </p>
                </div>

                {/* Quick Stats - Dynamic from API */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package className="w-3 h-3 text-green" />
                    </div>
                    <div>
                      <p className="text-body-sm text-gray-500">Available Products</p>
                      <p className="text-cta-sm text-gray-700">
                        {subCategories.reduce((acc, sub) => acc + (sub.product_count || 0), 0)} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3 h-3 text-orange" />
                    </div>
                    <div>
                      <p className="text-body-sm text-gray-500">Delivery Time</p>
                      <p className="text-cta-sm text-gray-700">{content.stats.delivery_time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-royal-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-3 h-3 text-royal-blue" />
                    </div>
                    <div>
                      <p className="text-body-sm text-gray-500">Quality Guarantee</p>
                      <p className="text-cta-sm text-gray-700">{content.stats.quality_guarantee}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-purple" />
                    </div>
                    <div>
                      <p className="text-body-sm text-gray-500">Customer Rating</p>
                      <p className="text-cta-sm text-gray-700">{content.stats.customer_rating}</p>
                    </div>
                  </div>
                </div>

                {/* Popular Products - Dynamic from API */}
                {content.popular_products && content.popular_products.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      {/* ⬇️ UPDATED: Popular products title with Sora ⬇️ */}
                      <h4 className="heading-sm text-royal-blue">Popular Products</h4>
                    </div>
                    <div className="space-y-3">
                      {content.popular_products.map((product) => {
                        // Check if product has a slug (real data from admin)
                        const hasSlug = product.slug && product.slug.trim() !== '';
                        
                        const productContent = (
                          <div className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={getImageUrl(product.image) || '/api/placeholder/80/80'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* ⬇️ UPDATED: Product name with Sora ⬇️ */}
                              <p className="text-body-sm font-medium text-gray-800 truncate group-hover:text-royal-blue transition">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                  {renderStars(product.rating)}
                                </div>
                                <span className="text-body-sm text-gray-500">{product.rating}</span>
                              </div>
                              {/* ⬇️ UPDATED: Price with Inter bold ⬇️ */}
                              <p className="price-sm text-royal-blue">
                                ETB {product.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );

                        // If slug exists, wrap in Link, otherwise just render the content
                        return hasSlug ? (
                          <Link 
                            key={product.id}
                            to={`/products/product/${product.slug}`}
                            className="block group"
                          >
                            {productContent}
                          </Link>
                        ) : (
                          <div key={product.id} className="block group">
                            {productContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trust Badge - Dynamic from API */}
                {content.trust_badge && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="bg-green/5 rounded-lg p-3 text-center">
                      <Award className="w-6 h-6 text-green mx-auto mb-1" />
                      {/* ⬇️ UPDATED: Trust badge text with Inter ⬇️ */}
                      <p className="text-body-sm font-medium text-royal-blue">{content.trust_badge.title}</p>
                      <p className="text-body-sm text-gray-500">{content.trust_badge.rating}</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </ScrollReveal>
      
      <ScrollReveal direction="up">
        {/* Section 3: How to Order - Dynamic from API */}
        {content.how_to_order && content.how_to_order.length > 0 && (
          <section className="bg-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 border-t border-green-100">
              <div className="text-center mb-10 mt-2">
                {/* ⬇️ UPDATED: How to Order title with Sora ⬇️ */}
                <h2 className="heading-lg text-green mb-2">
                  How to Order
                </h2>
                {/* ⬇️ UPDATED: Subtitle with Inter ⬇️ */}
                <p className="text-body text-gray-500 max-w-2xl mx-auto">
                  Follow these simple steps to get your custom printed products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.how_to_order.map((step, index) => (
                  <div key={step.id} className="relative group">
                    <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300 h-full">
                      {/* Step Number */}
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-royal-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Icon */}
                      <div className="w-14 h-14 mx-auto mb-4 bg-royal-blue/10 rounded-full flex items-center justify-center text-royal-blue group-hover:bg-royal-blue group-hover:text-white transition-colors duration-300">
                        {getIcon(step.icon)}
                      </div>
                      
                      {/* ⬇️ UPDATED: Step title with Sora ⬇️ */}
                      <h3 className="heading-sm text-gray-800 mb-2">
                        {step.title}
                      </h3>
                      {/* ⬇️ UPDATED: Step description with Inter ⬇️ */}
                      <p className="text-body-sm text-gray-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </ScrollReveal>
      
      {/* Section 4: Frequently Asked Questions - Dynamic from API */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              {/* ⬇️ UPDATED: FAQ title with Sora + gradient ⬇️ */}
              <h2 className="heading-lg text-royal-blue-dark mb-2">
                <span className=''>Frequently</span> Asked Questions
              </h2>
              {/* ⬇️ UPDATED: FAQ subtitle with Inter ⬇️ */}
              <p className="text-body text-gray-500">
                Find answers to common questions about {category.display_name}
              </p>
            </div>

            <div className="space-y-3">
              {content.faqs.map((faq) => (
                <div 
                  key={faq.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    {/* ⬇️ UPDATED: FAQ question with Sora ⬇️ */}
                    <span className="heading-sm text-gray-600 pr-4">
                      {faq.question}
                    </span>
                    <span className="flex-shrink-0">
                      {expandedFaq === faq.id ? (
                        <Minus className="w-5 h-5 text-royal-blue" />
                      ) : (
                        <Plus className="w-5 h-5 text-royal-blue" />
                      )}
                    </span>
                  </button>
                  
                  {/* FAQ Answer - Collapsible */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {/* ⬇️ UPDATED: FAQ answer with Inter ⬇️ */}
                    <div className="px-4 pb-4 text-body-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const SubCategoryCard: React.FC<{ 
  subCategory: SubCategory; 
  categorySlug: string;
  size: CardSize;
}> = ({ subCategory, categorySlug, size }) => {
  const isLarge = size === 'large';
  
  return (
    <Link 
      to={`/products/category/${categorySlug}/${subCategory.slug}`} 
      className="block group"
    >
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full ${isLarge ? 'max-w-2xl mx-auto' : ''}`}>
        <div className={`p-3 pb-1 ${isLarge ? 'md:p-5' : ''}`}>
          <div className={`relative overflow-hidden bg-gray-100 rounded-lg ${
            isLarge 
              ? 'aspect-[4/3] md:aspect-[3/2]' 
              : 'aspect-[1/1]'
          }`}>
            <img
              src={getImageUrl(subCategory.image_url) || '/api/placeholder/400/400'}
              alt={subCategory.display_name}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-lg" />
            
            <div className="absolute bottom-3 right-3 bg-green/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {subCategory.product_count || 0} {subCategory.product_count === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
        
        <div className={`p-3 pt-1 ${isLarge ? 'md:p-5 md:pt-3' : ''}`}>
          {/* ⬇️ UPDATED: Subcategory name with Sora ⬇️ */}
          <h3 className={`heading-sm text-orange ${isLarge ? 'text-lg md:text-xl' : ''} mb-1 line-clamp-1 group-hover:text-orange/80 transition`}>
            {subCategory.display_name}
          </h3>
          {/* ⬇️ UPDATED: Subcategory description with Inter ⬇️ */}
          <p className={`${isLarge ? 'text-body' : 'text-body-sm'} text-royal-blue line-clamp-2 leading-relaxed`}>
            {subCategory.description || 'Discover our collection'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryProducts;