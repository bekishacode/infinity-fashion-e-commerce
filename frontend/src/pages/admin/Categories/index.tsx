// src/pages/admin/Categories/index.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../utils/apiClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Search,
  Loader2
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  display_name: string;
  slug: string;
  is_active: number;
  sort_order: number;
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/categories/list');
      if (response.success && response.data) {
        setCategories(response.data as Category[]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-royal-blue mx-auto mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-royal-blue">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage page content for your product categories</p>
        </div>
        {/* Redirect to Picklist Management for creating categories */}
        <Link 
          to="/admin/picklists"
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition"
        >
          <Plus className="w-4 h-4" />
          Manage Categories
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
          <p className="text-gray-500 mt-2">Create categories in the Picklist Management</p>
          <Link 
            to="/admin/picklists"
            className="inline-block mt-4 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark transition"
          >
            Go to Picklist Management
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-royal-blue-dark">{category.display_name}</h3>
                  <p className="text-sm text-gray-500">{category.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Slug: {category.slug}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex gap-12 mt-4 pt-4 border-t border-gray-100">
                <Link 
                  to={`/admin/categories/${category.id}/content`}
                  className="text-center px-3 py-1.5 text-sm text-royal-blue font-medium rounded-lg transition"
                >
                  Edit Content
                </Link>
                <Link 
                  to="/admin/picklists"
                  className="px-3 py-1.5 text-sm bg-gray-100 text-orange rounded-lg hover:bg-gray-200 transition"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <Link 
                  to={`/products/category/${category.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 text-sm bg-gray-100 text-royal-blue rounded-lg hover:bg-gray-200 transition"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;