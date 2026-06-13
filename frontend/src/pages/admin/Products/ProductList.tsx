import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, getImageUrl } from '../../../services/adminService';

interface Product {
  id: number;
  name: string;
  price: number;
  service_type: string;
  category: string;
  sub_category: string | null;
  is_active: string | number;
  images?: string[];
  primary_image?: string;
}

type FilterStatus = 'all' | 'active' | 'trash';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1
  });
  const [counts, setCounts] = useState({ all: 0, active: 0, trash: 0 });
  const [allProductsCache, setAllProductsCache] = useState<Product[]>([]);

  const isProductActive = (product: Product): boolean => {
    return product.is_active === 1 || product.is_active === '1';
  };

  const updateCounts = async () => {
    try {
      const result = await adminService.getProducts({ limit: 100, show_inactive: true }) as ApiResponse<{ products: Product[] }>;
      if (result.success && result.data) {
        const allProds = result.data.products;
        const activeCount = allProds.filter((p) => isProductActive(p)).length;
        const trashCount = allProds.length - activeCount;
        setCounts({ all: allProds.length, active: activeCount, trash: trashCount });
      }
    } catch (error) {
      console.error('Error updating counts:', error);
    }
  };

  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const result = await adminService.getProducts({ limit: 100, show_inactive: true }) as ApiResponse<{ products: Product[] }>;
        if (result.success && result.data) {
          const allProds = result.data.products;
          setAllProductsCache(allProds);
          const activeCount = allProds.filter((p) => isProductActive(p)).length;
          const trashCount = allProds.length - activeCount;
          setCounts({ all: allProds.length, active: activeCount, trash: trashCount });
        }
      } catch (error) {
        console.error('Error loading all products:', error);
      }
    };
    loadAllProducts();
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      if (filterStatus === 'trash') {
        const inactiveProducts = allProductsCache.filter((p) => !isProductActive(p));
        let filteredProducts = inactiveProducts;
        if (search) {
          filteredProducts = inactiveProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        const start = (page - 1) * pagination.per_page;
        const end = start + pagination.per_page;
        const paginatedProducts = filteredProducts.slice(start, end);
        setProducts(paginatedProducts);
        setPagination({
          current_page: page,
          per_page: pagination.per_page,
          total: filteredProducts.length,
          total_pages: Math.ceil(filteredProducts.length / pagination.per_page)
        });
      } else {
        const showInactive = filterStatus === 'all' ? true : false;
        const result = await adminService.getProducts({ page, search: search || undefined, show_inactive: showInactive }) as ApiResponse<{ products: Product[]; pagination: any }>;
        if (result.success && result.data) {
          let productsData = result.data.products;
          if (filterStatus === 'active') {
            productsData = productsData.filter((p) => isProductActive(p));
          }
          setProducts(productsData);
          setPagination(result.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, filterStatus, allProductsCache]);

  const handleSoftDelete = async (id: number) => {
    if (window.confirm('Move this product to trash?')) {
      const result = await adminService.deleteProduct(id, false);
      if (result.success) {
        const refreshResult = await adminService.getProducts({ limit: 100, show_inactive: true }) as ApiResponse<{ products: Product[] }>;
        if (refreshResult.success && refreshResult.data) {
          setAllProductsCache(refreshResult.data.products);
          fetchProducts(pagination.current_page);
          await updateCounts();
        }
      } else {
        alert(result.message);
      }
    }
  };

  const handleRestore = async (id: number) => {
    if (window.confirm('Restore this product from trash?')) {
      const result = await adminService.restoreProduct(id);
      if (result.success) {
        const refreshResult = await adminService.getProducts({ limit: 100, show_inactive: true }) as ApiResponse<{ products: Product[] }>;
        if (refreshResult.success && refreshResult.data) {
          setAllProductsCache(refreshResult.data.products);
          fetchProducts(pagination.current_page);
          await updateCounts();
        }
      } else {
        alert(result.message);
      }
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (window.confirm('⚠️ Permanently delete this product? This action cannot be undone!')) {
      const result = await adminService.deleteProduct(id, true);
      if (result.success) {
        const refreshResult = await adminService.getProducts({ limit: 100, show_inactive: true }) as ApiResponse<{ products: Product[] }>;
        if (refreshResult.success && refreshResult.data) {
          setAllProductsCache(refreshResult.data.products);
          fetchProducts(pagination.current_page);
          await updateCounts();
        }
      } else {
        alert(result.message);
      }
    }
  };

  const getImageUrlForProduct = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    if (product.primary_image) {
      return getImageUrl(product.primary_image);
    }
    return null;
  };

  const getServiceTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      retail: 'bg-green-100 text-green-800',
      wholesale: 'bg-blue-100 text-blue-800',
      pod: 'bg-purple-100 text-purple-800'
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const startItem = (pagination.current_page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);
  const showingText = `Showing ${startItem} to ${endItem} of ${pagination.total} products`;

  if (loading && products.length === 0 && filterStatus !== 'trash') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Sticky at top */}
      <div className="flex-shrink-0 bg-gray-50 mt-10 -mx-6 px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-green">Company <span className='text-charcoal'>Products</span></h1>
            <p className="text-gray-500 text-md mt-1">Add, edit, and organize your product catalog. Filter by status or search to quickly find what you need.</p>
          </div>
          <Link
            to="/admin/products/create"
            className="flex items-center gap-2 text-gradient-secondary px-4 py-2 rounded-lg hover:shadow-lg text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 transition-all duration-300 ${search ? 'text-royal-blue scale-110' : 'text-gray-400 group-focus-within:text-royal-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-28 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue bg-gray-50 hover:bg-white transition-all duration-200"
            />
            
            {search && products.length > 0 && (
              <div className="absolute inset-y-0 right-12 pr-2 flex items-center pointer-events-none">
                <span className="text-xs text-royal-blue bg-royal-blue/10 px-2 py-0.5 rounded-full">
                  {products.length} results
                </span>
              </div>
            )}
            
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center group/clear"
                title="Clear search"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {loading && (
              <div className="absolute inset-y-0 right-12 pr-2 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-royal-blue border-t-transparent rounded-full"></div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-royal-blue to-magenta transition-all duration-300 group-focus-within:w-[calc(100%-2rem)]"></div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'all'
                  ? 'bg-royal-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Active ({counts.active})
            </button>
            <button
              onClick={() => setFilterStatus('trash')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === 'trash'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Trash ({counts.trash})
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-auto mt-5 rounded-xl">
        <div className="bg-white shadow-sm rounded-xl border">
          <table className="w-full">
            <thead className="bg-green-light sticky top-0 z-10 rounded-xl">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Sub-Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product, index) => {
                  const isActive = isProductActive(product);
                  const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr key={product.id} className={`${bgColor} border-b hover:bg-blue-50 transition`}>
                      <td className="px-2 py-3 text-sm text-gray-500">#{product.id}</td>
                      <td className="px-2 py-3">
                        {getImageUrlForProduct(product) ? (
                          <img src={getImageUrlForProduct(product)!} alt={product.name} className="w-10 h-10 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">📷</div>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <p className="font-medium text-charcoal">{product.name}</p>
                      </td>
                      <td className="px-2 py-3 text-sm font-semibold text-royal-blue">ETB {product.price}</td>
                      <td className="px-2 py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getServiceTypeBadge(product.service_type)}`}>
                          {product.service_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{product.sub_category || '—'}</td>
                      <td className="px-2 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Trashed
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex gap-2">
                          <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-800 text-sm">Edit</Link>
                          {isActive ? (
                            <button onClick={() => handleSoftDelete(product.id)} className="text-orange-600 hover:text-orange-800 text-sm">Move to Trash</button>
                          ) : (
                            <>
                              <button onClick={() => handleRestore(product.id)} className="text-green-600 hover:text-green-800 text-sm">Restore</button>
                              <button onClick={() => handlePermanentDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.total_pages > 0 && (
            <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                {showingText}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchProducts(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => fetchProducts(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;