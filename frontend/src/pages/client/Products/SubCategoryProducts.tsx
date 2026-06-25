import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient, getImageUrl } from '../../../utils/apiClient';
import { ArrowLeft, Package, ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  service_type: string;
  badge: string | null;
  badge_color: string | null;
  rating: number;
  review_count: number;
  primary_image: string | null;
  in_stock: number;
  min_quantity: number;
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  banner_image: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  display_name: string;
}

const SubCategoryProducts: React.FC = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchProducts();
  }, [subCategorySlug, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/products/by-subcategory', {
        slug: subCategorySlug,
        sort: sortBy
      });
      // Add type assertion
      if (response.success && response.data) {
        const data = response.data as { sub_category: SubCategory; category: Category; products: Product[] };
        setSubCategory(data.sub_category);
        setCategory(data.category);
        setProducts(data.products);
        // Scroll to top after data loads
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!subCategory) {
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
      {/* Sub-category Banner */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src={getImageUrl(subCategory.banner_image) || '/api/placeholder/1200/350'}
          alt={subCategory.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-white/80 mb-3">
              <Link to="/products" className="hover:text-white">Products</Link>
              <span>/</span>
              <Link to={`/products/category/${categorySlug}`} className="hover:text-white">{category?.display_name}</Link>
              <span>/</span>
              <span className="text-white">{subCategory.display_name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{subCategory.display_name}</h1>
            <p className="text-white/80 max-w-2xl">{subCategory.description}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sort Options */}
        <div className="flex justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-royal-blue"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500 mt-2">Check back soon for new arrivals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} renderStars={renderStars} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; renderStars: (rating: number) => JSX.Element[] }> = ({ product, renderStars }) => {
  const isPOD = product.service_type === 'pod';

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <Link to={`/products/product/${product.slug}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={getImageUrl(product.primary_image) || '/api/placeholder/400/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.badge && (
            <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold text-white ${
              product.badge_color === 'orange' ? 'bg-orange-500' : 'bg-royal-blue'
            }`}>
              {product.badge}
            </div>
          )}
          {isPOD && (
            <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Customizable
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-royal-blue transition">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(product.rating)}
          <span className="text-xs text-gray-500 ml-1">({product.review_count})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-royal-blue">
            ETB {product.price.toLocaleString()}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-400 line-through">
              ETB {product.compare_price.toLocaleString()}
            </span>
          )}
        </div>
        <button
          className="w-full mt-3 bg-royal-blue text-white py-2 rounded-lg font-medium hover:bg-royal-blue-dark transition flex items-center justify-center gap-2"
        >
          {isPOD ? <Sparkles className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {isPOD ? 'Customize Now' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default SubCategoryProducts;