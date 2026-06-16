import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { getImageUrl } from '../../utils/apiClient';
import SkeletonLoader from '../../components/common/SkeletonLoader';

interface ServiceType {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: number;
  service_type_id: number;
  name: string;
  display_name: string;
  slug: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  service_type_name?: string;
}

interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  display_name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  category_name?: string;
}

interface LocalImage {
  file: File;
  previewUrl: string;
  isUploading: boolean;
}

type TabType = 'service-types' | 'categories' | 'sub-categories';

const PicklistManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('service-types');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Local images for upload (not yet saved)
  const [localCategoryImages, setLocalCategoryImages] = useState<Map<number, LocalImage>>(new Map());
  const [localSubCategoryImages, setLocalSubCategoryImages] = useState<Map<number, LocalImage>>(new Map());
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    slug: '',
    icon: '',
    sort_order: 0,
    service_type_id: 0,
    category_id: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      localCategoryImages.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
      localSubCategoryImages.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [localCategoryImages, localSubCategoryImages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'service-types') {
        const result = await adminService.getServiceTypes();
        if (result.success) setServiceTypes(result.data);
      } else if (activeTab === 'categories') {
        const result = await adminService.getCategories();
        if (result.success) {
          const categoriesData = result.data.map((cat: any) => ({
            ...cat,
            image_url: cat.image_url || null
          }));
          setCategories(categoriesData);
        }
      } else {
        const result = await adminService.getSubCategories();
        if (result.success) {
          const subCategoriesData = result.data.map((sub: any) => ({
            ...sub,
            image_url: sub.image_url || null
          }));
          setSubCategories(subCategoriesData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && serviceTypes.length === 0 && categories.length === 0 && subCategories.length === 0) {
    return <SkeletonLoader type="table" rows={16} columns={8} />;
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      display_name: '',
      slug: '',
      icon: '',
      sort_order: 0,
      service_type_id: 0,
      category_id: 0
    });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      display_name: item.display_name || '',
      slug: item.slug || '',
      icon: item.icon || '',
      sort_order: item.sort_order || 0,
      service_type_id: item.service_type_id || 0,
      category_id: item.category_id || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        let result;
        if (activeTab === 'service-types') {
          result = await adminService.deleteServiceType(id);
        } else if (activeTab === 'categories') {
          result = await adminService.deleteCategory(id);
        } else {
          result = await adminService.deleteSubCategory(id);
        }
        
        if (result.success) {
          showMessage('success', 'Deleted successfully');
          fetchData();
        } else {
          showMessage('error', result.message || 'Delete failed');
        }
      } catch (error) {
        showMessage('error', 'Something went wrong');
      }
    }
  };

  const handleImageSelect = (itemId: number, type: 'category' | 'sub_category', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Max 5MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const localImage: LocalImage = { file, previewUrl, isUploading: false };

    if (type === 'category') {
      setLocalCategoryImages(prev => new Map(prev).set(itemId, localImage));
    } else {
      setLocalSubCategoryImages(prev => new Map(prev).set(itemId, localImage));
    }
  };

  const removeLocalImage = (itemId: number, type: 'category' | 'sub_category') => {
    if (type === 'category') {
      const img = localCategoryImages.get(itemId);
      if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
      setLocalCategoryImages(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    } else {
      const img = localSubCategoryImages.get(itemId);
      if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
      setLocalSubCategoryImages(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
    }
  };

  const uploadImage = async (itemId: number, file: File, type: 'category' | 'sub_category'): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('id', itemId.toString());
    
    const endpoint = type === 'category' 
      ? '/categories/upload-image.php'
      : '/sub-categories/upload-image.php';
    
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      return result.data.image_url;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  };

  const handleSaveImage = async (itemId: number, type: 'category' | 'sub_category') => {
    const localImage = type === 'category' 
      ? localCategoryImages.get(itemId)
      : localSubCategoryImages.get(itemId);
    
    if (!localImage) return;

    // Mark as uploading
    if (type === 'category') {
      setLocalCategoryImages(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, { ...localImage, isUploading: true });
        return newMap;
      });
    } else {
      setLocalSubCategoryImages(prev => {
        const newMap = new Map(prev);
        newMap.set(itemId, { ...localImage, isUploading: true });
        return newMap;
      });
    }

    try {
      // This one function uploads file AND updates database
      const uploadedUrl = await uploadImage(itemId, localImage.file, type);
      
      showMessage('success', 'Image uploaded successfully');
      fetchData(); // Refresh to show updated image
      
      // Clear local image
      if (type === 'category') {
        setLocalCategoryImages(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemId);
          return newMap;
        });
      } else {
        setLocalSubCategoryImages(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemId);
          return newMap;
        });
      }
    } catch (error) {
      showMessage('error', 'Failed to upload image');
      // Reset uploading state
      if (type === 'category') {
        setLocalCategoryImages(prev => {
          const newMap = new Map(prev);
          newMap.set(itemId, { ...localImage, isUploading: false });
          return newMap;
        });
      } else {
        setLocalSubCategoryImages(prev => {
          const newMap = new Map(prev);
          newMap.set(itemId, { ...localImage, isUploading: false });
          return newMap;
        });
      }
    }
  };

  const renderImageSection = (item: any, type: 'category' | 'sub_category') => {
    const localImage = type === 'category' 
      ? localCategoryImages.get(item.id)
      : localSubCategoryImages.get(item.id);
    
    const currentImageUrl = localImage?.previewUrl || getImageUrl(item.image_url);
    const isUploading = localImage?.isUploading || false;

    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="Thumb" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>
        
        {!localImage ? (
          <label className="cursor-pointer text-sm text-royal-blue hover:underline">
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect(item.id, type, e.target.files)}
            />
          </label>
        ) : (
          <div className="flex items-center gap-2">
            {isUploading ? (
              <span className="text-sm text-gray-500">Uploading...</span>
            ) : (
              <>
                <button
                  onClick={() => handleSaveImage(item.id, type)}
                  className="text-sm bg-royal-blue text-white px-3 py-1 rounded hover:bg-royal-blue-dark"
                >
                  Save
                </button>
                <button
                  onClick={() => removeLocalImage(item.id, type)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      
      if (activeTab === 'service-types') {
        // Service types don't have slug
        const submitData = {
          name: formData.name,
          display_name: formData.display_name,
          icon: formData.icon,
          sort_order: formData.sort_order
        };
        
        if (editingItem) {
          result = await adminService.updateServiceType(editingItem.id, submitData);
        } else {
          result = await adminService.createServiceType(submitData);
        }
      } 
      else if (activeTab === 'categories') {
        if (!formData.service_type_id) {
          showMessage('error', 'Please select a service type');
          setLoading(false);
          return;
        }
        
        const submitData = {
          service_type_id: formData.service_type_id,
          name: formData.name,
          display_name: formData.display_name,
          slug: formData.slug || generateSlug(formData.name),
          icon: formData.icon,
          sort_order: formData.sort_order
        };
        
        if (editingItem) {
          result = await adminService.updateCategory(editingItem.id, submitData);
        } else {
          result = await adminService.createCategory(submitData);
        }
      } 
      else {
        if (!formData.category_id) {
          showMessage('error', 'Please select a category');
          setLoading(false);
          return;
        }
        
        const submitData = {
          category_id: formData.category_id,
          name: formData.name,
          display_name: formData.display_name,
          slug: formData.slug || generateSlug(formData.name),
          sort_order: formData.sort_order
        };
        
        if (editingItem) {
          result = await adminService.updateSubCategory(editingItem.id, submitData);
        } else {
          result = await adminService.createSubCategory(submitData);
        }
      }
      
      if (result && result.success) {
        showMessage('success', editingItem ? 'Updated successfully' : 'Created successfully');
        setShowModal(false);
        fetchData();
      } else {
        showMessage('error', result?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-14">
      <div>
        <h1 className="text-2xl font-bold text-green">Picklist <span className="text-orange">Management</span></h1>
        <p className="text-gray-500 text-sm">Manage service types, categories, and sub-categories</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('service-types')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'service-types'
                ? 'text-royal-blue font-semibold border-b-2 border-magenta'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Service Types
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'text-royal-blue font-semibold border-b-2 border-magenta'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('sub-categories')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'sub-categories'
                ? 'text-royal-blue font-semibold border-b-2 border-magenta'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sub-Categories
          </button>
        </nav>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-royal-blue text-white px-4 py-2 rounded-lg hover:bg-royal-blue-dark transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {activeTab === 'service-types' ? 'Service Type' : activeTab === 'categories' ? 'Category' : 'Sub-Category'}
        </button>
      </div>

      {/* Service Types Table - No Slug */}
      {activeTab === 'service-types' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-green-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceTypes.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">#{item.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.display_name}</td>
                  <td className="px-4 py-3 text-sm">{item.sort_order}</td>
                  <td className="px-4 py-3">
                    {item.is_active ? (
                      <span className="text-green-600 text-sm">Active</span>
                    ) : (
                      <span className="text-red-600 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(item.id, item.display_name)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Categories Table - Has Slug */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-green-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">#{item.id}</td>
                  <td className="px-4 py-3 text-sm">{item.service_type_name}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{item.slug}</td>
                  <td className="px-4 py-3 text-sm">{item.display_name}</td>
                  <td className="px-4 py-3">{renderImageSection(item, 'category')}</td>
                  <td className="px-4 py-3 text-sm">{item.sort_order}</td>
                  <td className="px-4 py-3">
                    {item.is_active ? (
                      <span className="text-green-600 text-sm">Active</span>
                    ) : (
                      <span className="text-red-600 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(item.id, item.display_name)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-Categories Table - Has Slug */}
      {activeTab === 'sub-categories' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-green-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subCategories.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">#{item.id}</td>
                  <td className="px-4 py-3 text-sm">{item.category_name}</td>
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{item.slug}</td>
                  <td className="px-4 py-3 text-sm">{item.display_name}</td>
                  <td className="px-4 py-3">{renderImageSection(item, 'sub_category')}</td>
                  <td className="px-4 py-3 text-sm">{item.sort_order}</td>
                  <td className="px-4 py-3">
                    {item.is_active ? (
                      <span className="text-green-600 text-sm">Active</span>
                    ) : (
                      <span className="text-red-600 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(item.id, item.display_name)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit' : 'Add'} {activeTab === 'service-types' ? 'Service Type' : activeTab === 'categories' ? 'Category' : 'Sub-Category'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {activeTab === 'categories' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Service Type *</label>
                  <select
                    value={formData.service_type_id}
                    onChange={(e) => setFormData({ ...formData, service_type_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  >
                    <option value={0}>Select Service Type</option>
                    {serviceTypes.map(st => (
                      <option key={st.id} value={st.id}>{st.display_name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeTab === 'sub-categories' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    required
                  >
                    <option value={0}>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.display_name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Name (code) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="e.g., t-shirts, long-sleeve"
                  required
                  disabled={!!editingItem}
                />
                <p className="text-xs text-gray-400 mt-1">Unique identifier (lowercase, no spaces)</p>
              </div>

              {/* Slug field - Only for Categories and Sub-categories */}
              {(activeTab === 'categories' || activeTab === 'sub-categories') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="e.g., t-shirts-pod"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">URL-friendly identifier (auto-generated from name)</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Display Name *</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="e.g., T-Shirts, Long Sleeve"
                  required
                />
              </div>
              
              {(activeTab === 'service-types' || activeTab === 'categories') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                    placeholder="e.g., 👕"
                    maxLength={2}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-royal-blue"
                  placeholder="0"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PicklistManagement;