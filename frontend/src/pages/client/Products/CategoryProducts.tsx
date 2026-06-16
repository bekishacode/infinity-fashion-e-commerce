import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { ArrowLeft, Package } from 'lucide-react';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  image_url: string | null;
  product_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  banner_image: string | null;
}

const CategoryProducts: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const location = useLocation();
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract service type from URL query params or from the category slug
  const getServiceType = () => {
    const searchParams = new URLSearchParams(location.search);
    const serviceFromQuery = searchParams.get('service');
    if (serviceFromQuery) return serviceFromQuery;
    
    // Try to extract from category slug (e.g., t-shirts-retail -> retail)
    if (categorySlug) {
      const parts = categorySlug.split('-');
      const lastPart = parts[parts.length - 1];
      if (['retail', 'wholesale', 'pod'].includes(lastPart)) {
        return lastPart;
      }
    }
    return 'retail'; // default
  };

  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Category not found</h2>
          <Link to="/products" className="text-royal-blue mt-4 inline-block hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Banner */}
      <div className="relative h-36 md:h-34 lg:h-44 overflow-hidden">
        <img
          src={getImageUrl(category.banner_image) || '/api/placeholder/1200/400'}
          alt={category.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/products" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm md:text-base">
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Link>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">{category.display_name}</h1>
            <p className="text-white/80 max-w-2xl text-sm md:text-base">{category.description || 'Explore our collection'}</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {subCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No sub-categories found</h3>
            <p className="text-gray-500 mt-2">Check back soon for new products</p>
          </div>
        ) : (
          <>
            <div className="mb-6 md:mb-8">
              <p className="text-gray-500 text-sm">
                Showing {subCategories.length} sub-categories
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {subCategories.map((subCategory) => (
                <SubCategoryCard 
                  key={subCategory.id} 
                  subCategory={subCategory} 
                  categorySlug={category.slug} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SubCategoryCard: React.FC<{ subCategory: SubCategory; categorySlug: string }> = ({ subCategory, categorySlug }) => {
  return (
    <Link 
      to={`/products/category/${categorySlug}/${subCategory.slug}`} 
      className="block group"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
        {/* Image Container with padding from card edges */}
        <div className="p-3 pb-1">
          <div className="relative aspect-[1/1] overflow-hidden bg-gray-100 rounded-lg">
            <img
              src={getImageUrl(subCategory.image_url) || '/api/placeholder/400/400'}
              alt={subCategory.display_name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/10 to-transparent rounded-lg" />
            
            {/* Product count badge */}
            <div className="absolute bottom-3 right-3 bg-green backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              {subCategory.product_count} {subCategory.product_count === 1 ? 'product' : 'products'}
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-3 pt-1">
          <h3 className="font-semibold text-orange text-sm md:text-base mb-1 line-clamp-1">
            {subCategory.display_name}
          </h3>
          <p className="text-xs text-royal-blue line-clamp-2 leading-relaxed">
            {subCategory.description || 'Discover our collection'}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryProducts;