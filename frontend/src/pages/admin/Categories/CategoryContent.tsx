// src/pages/admin/Categories/CategoryContent.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Package,
  Truck,
  Palette,
  Shield,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Loader2,
  Search,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Grid3x3,
  List,
  Check
} from 'lucide-react';

interface HowToOrderStep {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface PopularProduct {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
}

interface Stats {
  delivery_time: string;
  quality_guarantee: string;
  customer_rating: string;
}

interface TrustBadge {
  title: string;
  rating: string;
}

interface CategoryContent {
  how_to_order: HowToOrderStep[];
  faqs: FAQ[];
  popular_products: PopularProduct[];
  stats: Stats;
  trust_badge: TrustBadge;
}

interface ProductOption {
  id: number;
  name: string;
  price: number;
  rating: number;
  primary_image: string | null;
  slug: string;
}

const ICON_OPTIONS = [
  { value: 'Palette', label: '🎨 Palette' },
  { value: 'Truck', label: '🚚 Truck' },
  { value: 'Shield', label: '🛡️ Shield' },
  { value: 'CheckCircle', label: '✅ Check Circle' },
  { value: 'Package', label: '📦 Package' },
  { value: 'Clock', label: '🕐 Clock' },
  { value: 'Award', label: '🏆 Award' },
  { value: 'Zap', label: '⚡ Zap' },
];

const CategoryContent: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<{ id: number; name: string; display_name: string; slug: string } | null>(null);
  const [content, setContent] = useState<CategoryContent>({
    how_to_order: [],
    faqs: [],
    popular_products: [],
    stats: {
      delivery_time: '',
      quality_guarantee: '',
      customer_rating: ''
    },
    trust_badge: {
      title: '',
      rating: ''
    }
  });
  
  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [filteredProductOptions, setFilteredProductOptions] = useState<ProductOption[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchProducts();
  }, [categoryId]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/categories/get-content?category_id=${categoryId}`);
      if (response.success && response.data) {
        const data = response.data as any;
        setCategory(data.category || null);
        setContent(data.content || {
          how_to_order: [],
          faqs: [],
          popular_products: [],
          stats: { delivery_time: '', quality_guarantee: '', customer_rating: '' },
          trust_badge: { title: '', rating: '' }
        });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get(`/products/by-category?category_id=${categoryId}&limit=100`);
      if (response.success && response.data) {
        setProductOptions(response.data as ProductOption[]);
        setFilteredProductOptions(response.data as ProductOption[]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.post('/admin/categories/save-content', {
        category_id: parseInt(categoryId!),
        ...content
      });
      if (response.success) {
        alert('Content saved successfully!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // How to Order Functions
  const addHowToOrderStep = () => {
    const newStep: HowToOrderStep = {
      id: Date.now(),
      icon: 'Package',
      title: '',
      description: ''
    };
    setContent({
      ...content,
      how_to_order: [...content.how_to_order, newStep]
    });
  };

  const updateHowToOrderStep = (index: number, field: keyof HowToOrderStep, value: string) => {
    const updated = [...content.how_to_order];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, how_to_order: updated });
  };

  const removeHowToOrderStep = (index: number) => {
    setContent({
      ...content,
      how_to_order: content.how_to_order.filter((_, i) => i !== index)
    });
  };

  // FAQ Functions
  const addFaq = () => {
    const newFaq: FAQ = {
      id: Date.now(),
      question: '',
      answer: ''
    };
    setContent({
      ...content,
      faqs: [...content.faqs, newFaq]
    });
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...content.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, faqs: updated });
  };

  const removeFaq = (index: number) => {
    setContent({
      ...content,
      faqs: content.faqs.filter((_, i) => i !== index)
    });
  };

  // Popular Products Functions
  const openProductSelector = () => {
    setIsAddingProduct(true);
    setShowProductSelector(true);
    setProductSearch('');
    setFilteredProductOptions(productOptions);
  };

  const closeProductSelector = () => {
    setShowProductSelector(false);
    setIsAddingProduct(false);
    setSelectedProductIndex(null);
    setProductSearch('');
  };

  const selectProduct = (product: ProductOption) => {
    // Check if product already added
    const exists = content.popular_products.some(p => p.id === product.id);
    if (exists) {
      alert('This product is already in the popular products list.');
      return;
    }

    const newProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      rating: product.rating || 0,
      image: product.primary_image || '/api/placeholder/80/80',
      slug: product.slug
    };
    
    setContent({
      ...content,
      popular_products: [...content.popular_products, newProduct]
    });
    
    closeProductSelector();
  };

  const removePopularProduct = (index: number) => {
    setContent({
      ...content,
      popular_products: content.popular_products.filter((_, i) => i !== index)
    });
  };

  const updatePopularProduct = (index: number, field: keyof PopularProduct, value: string | number) => {
    const updated = [...content.popular_products];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, popular_products: updated });
  };

  // Filter products on search
  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProductOptions(productOptions);
    } else {
      const filtered = productOptions.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProductOptions(filtered);
    }
  }, [productSearch, productOptions]);

  // Get already selected product IDs
  const selectedProductIds = content.popular_products.map(p => p.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-royal-blue mx-auto mb-4" />
          <p className="text-gray-500">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Category not found</h3>
          <Link to="/admin/categories" className="text-royal-blue hover:underline mt-2 inline-block">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto mt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/categories" className="inline-flex items-center gap-2 text-gray-500 hover:text-royal-blue text-sm mb-2 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-royal-blue flex items-center gap-3">
            <span>Page Content: {category.display_name}</span>
            <span className="text-sm font-normal text-green-dark bg-gray-100 px-3 py-1 rounded-full">
              {category.name}
            </span>
          </h1>
          <p className="text-gray-500 text-sm">Manage content displayed on the category page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white rounded-lg hover:shadow-lg hover:bg-green-dark transition disabled:opacity-50 font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-royal-blue mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-royal-blue rounded-full"></span>
          Category Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
            <input
              type="text"
              value={content.stats.delivery_time}
              onChange={(e) => setContent({
                ...content,
                stats: { ...content.stats, delivery_time: e.target.value }
              })}
              placeholder="e.g., 3-5 Business Days"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality Guarantee</label>
            <input
              type="text"
              value={content.stats.quality_guarantee}
              onChange={(e) => setContent({
                ...content,
                stats: { ...content.stats, quality_guarantee: e.target.value }
              })}
              placeholder="e.g., 100% Satisfaction"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Rating</label>
            <input
              type="text"
              value={content.stats.customer_rating}
              onChange={(e) => setContent({
                ...content,
                stats: { ...content.stats, customer_rating: e.target.value }
              })}
              placeholder="e.g., 4.8 / 5.0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
            />
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-royal-blue mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-orange rounded-full"></span>
          Trust Badge
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={content.trust_badge.title}
              onChange={(e) => setContent({
                ...content,
                trust_badge: { ...content.trust_badge, title: e.target.value }
              })}
              placeholder="e.g., Trusted by 500+ Customers"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <input
              type="text"
              value={content.trust_badge.rating}
              onChange={(e) => setContent({
                ...content,
                trust_badge: { ...content.trust_badge, rating: e.target.value }
              })}
              placeholder="e.g., 4.8/5 average rating"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
            />
          </div>
        </div>
      </div>

      {/* How to Order */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-royal-blue flex items-center gap-2">
              <span className="w-1 h-6 bg-green rounded-full"></span>
              How to Order Steps
            </h2>
            <p className="text-sm text-gray-500">Guide customers through the ordering process</p>
          </div>
          <button
            onClick={addHowToOrderStep}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        <div className="space-y-3">
          {content.how_to_order.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-royal-blue/30 transition">
              <div className="flex-shrink-0 mt-2 text-gray-400">
                <GripVertical className="w-4 h-4" />
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                  <select
                    value={step.icon}
                    onChange={(e) => updateHowToOrderStep(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateHowToOrderStep(index, 'title', e.target.value)}
                    placeholder="Step title"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateHowToOrderStep(index, 'description', e.target.value)}
                    placeholder="Step description"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
              </div>
              
              <button
                onClick={() => removeHowToOrderStep(index)}
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {content.how_to_order.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No steps added yet. Click "Add Step" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-royal-blue flex items-center gap-2">
              <span className="w-1 h-6 bg-purple rounded-full"></span>
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500">Answer common customer questions</p>
          </div>
          <button
            onClick={addFaq}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, index) => (
            <div key={faq.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-royal-blue/30 transition">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                    placeholder="Enter question"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Answer</label>
                  <input
                    type="text"
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                    placeholder="Enter answer"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
              </div>
              
              <button
                onClick={() => removeFaq(index)}
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {content.faqs.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Products - IMPROVED */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-royal-blue flex items-center gap-2">
              <span className="w-1 h-6 bg-yellow rounded-full"></span>
              Popular Products
            </h2>
            <p className="text-sm text-gray-500">Select products from this category to showcase in the sidebar</p>
          </div>
          <button
            onClick={openProductSelector}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Select Popular Products</h3>
                <button
                  onClick={closeProductSelector}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
                
                {/* Product Grid */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredProductOptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No products found in this category</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredProductOptions.map((product) => {
                        const isSelected = selectedProductIds.includes(product.id);
                        return (
                          <button
                            key={product.id}
                            onClick={() => !isSelected && selectProduct(product)}
                            disabled={isSelected}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition text-left ${
                              isSelected
                                ? 'bg-green-50 border-green-300 cursor-not-allowed opacity-60'
                                : 'bg-white border-gray-200 hover:border-royal-blue hover:bg-royal-blue/5'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={getImageUrl(product.primary_image) || '/api/placeholder/80/80'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                              <p className="text-xs text-royal-blue">ETB {product.price.toLocaleString()}</p>
                              {product.rating > 0 && (
                                <p className="text-xs text-gray-500">⭐ {product.rating}/5</p>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                            {!isSelected && (
                              <Link
                                to={`/products/product/${product.slug}`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-gray-400 hover:text-royal-blue transition flex-shrink-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end p-4 border-t bg-gray-50">
                <button
                  onClick={closeProductSelector}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Products List */}
        <div className="space-y-3 mt-4">
          {content.popular_products.map((product, index) => (
            <div key={product.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-royal-blue/30 transition">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={getImageUrl(product.image) || '/api/placeholder/80/80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updatePopularProduct(index, 'name', e.target.value)}
                    placeholder="Product name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updatePopularProduct(index, 'price', parseFloat(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rating</label>
                  <input
                    type="number"
                    value={product.rating}
                    onChange={(e) => updatePopularProduct(index, 'rating', parseFloat(e.target.value))}
                    placeholder="0"
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-blue/50 focus:border-royal-blue transition"
                  />
                </div>
              </div>
              
              <button
                onClick={() => removePopularProduct(index)}
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {content.popular_products.length === 0 && !showProductSelector && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No popular products added yet. Click "Add Product" to select from this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryContent;