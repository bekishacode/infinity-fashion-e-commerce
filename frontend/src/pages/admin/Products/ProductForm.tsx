import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

interface ProductFormData {
  name: string;
  price: number;
  compare_price: number | null;
  service_type: string;
  category: string;
  sub_category: string | null;
  badge: string | null;
  badge_color: string | null;
  description: string | null;
  material: string | null;
  min_quantity: number;
  in_stock: boolean;
  is_featured: boolean;
  images: string[];
}

interface ServiceType {
  id: number;
  name: string;
  display_name: string;
  icon: string;
}

interface Category {
  id: number;
  name: string;
  display_name: string;
  icon: string;
}

interface SubCategory {
  id: number;
  name: string;
  display_name: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Picklist data
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingPicklists, setLoadingPicklists] = useState(true);
  
  const [product, setProduct] = useState<ProductFormData>({
    name: '',
    price: 0,
    compare_price: null,
    service_type: '',
    category: '',
    sub_category: null,
    badge: null,
    badge_color: null,
    description: null,
    material: null,
    min_quantity: 1,
    in_stock: true,
    is_featured: false,
    images: []
  });

  // Load picklists
  useEffect(() => {
    loadPicklists();
  }, []);

  // Load categories when service type changes
  useEffect(() => {
    if (product.service_type) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [product.service_type]);

  // Load sub-categories when category changes
  useEffect(() => {
    if (product.category) {
      loadSubCategories();
    } else {
      setSubCategories([]);
    }
  }, [product.category]);

  // Change this useEffect:
  useEffect(() => {
    if (id && serviceTypes.length > 0) {
      fetchProduct();
    }
  }, [id, serviceTypes]);  // Add serviceTypes as dependency

  // Set sub-category value after subCategories are loaded
  useEffect(() => {
    if (subCategories.length > 0 && product.sub_category) {
      // Verify the sub_category exists in the loaded list
      const exists = subCategories.some(sub => sub.name === product.sub_category);
      if (!exists && product.sub_category) {
        // If the stored sub_category doesn't exist in current options, clear it
        setProduct(prev => ({ ...prev, sub_category: null }));
      }
    }
  }, [subCategories]);

  const loadPicklists = async () => {
    setLoadingPicklists(true);
    try {
      const serviceTypesRes = await adminService.getServiceTypes();
      if (serviceTypesRes.success) {
        setServiceTypes(serviceTypesRes.data);
      }
    } catch (error) {
      console.error('Error loading picklists:', error);
    } finally {
      setLoadingPicklists(false);
    }
  };

  const loadCategories = async () => {
    try {
      const selectedType = serviceTypes.find(st => st.name === product.service_type);
      if (selectedType) {
        const result = await adminService.getCategories(selectedType.id);
        if (result.success) setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubCategories = async () => {
    try {
      const selectedCategory = categories.find(cat => cat.name === product.category);
      if (selectedCategory) {
        const result = await adminService.getSubCategories(selectedCategory.id);
        if (result.success) setSubCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading sub-categories:', error);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const result = await adminService.getProduct(parseInt(id!));
      if (result.success) {
        const productData = result.data;
        setProduct(productData);
        
        // Load categories for the service type using current serviceTypes
        if (productData.service_type && serviceTypes.length > 0) {
          const selectedType = serviceTypes.find(st => st.name === productData.service_type);
          if (selectedType) {
            const categoriesResult = await adminService.getCategories(selectedType.id);
            if (categoriesResult.success) {
              setCategories(categoriesResult.data);
              
              // Load sub-categories for the product's category
              if (productData.category) {
                const selectedCategory = categoriesResult.data.find((cat: Category) => cat.name === productData.category);
                if (selectedCategory) {
                  const subResult = await adminService.getSubCategories(selectedCategory.id);
                  if (subResult.success) {
                    setSubCategories(subResult.data);
                  }
                }
              }
            }
          }
        }
      } else {
        alert('Product not found');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const newImageUrls: string[] = [];
    const token = localStorage.getItem('admin_token');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:8000/api/v1/admin/upload-image.php', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          newImageUrls.push(result.data.image_url);
          setProduct(prev => ({
            ...prev,
            images: [...prev.images, result.data.image_url]
          }));
          setUploadProgress(((i + 1) / files.length) * 100);
        } else {
          alert(`Failed to upload ${file.name}: ${result.message}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name || !product.price || !product.service_type || !product.category) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (id) {
        result = await adminService.updateProduct(parseInt(id), product);
      } else {
        result = await adminService.createProduct(product);
      }
      
      if (result.success) {
        alert(id ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/admin/products');
      } else {
        alert(result.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if ((loading && id) || loadingPicklists) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const selectedServiceType = serviceTypes.find(st => st.name === product.service_type);
  const selectedCategory = categories.find(cat => cat.name === product.category);

  return (
    <div className="max-w-4xl mx-auto mt-14">
      <h1 className="text-2xl font-bold text-royal-blue mb-6">
        {id ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-royal-blue"
                placeholder="e.g., Premium T-Shirt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (ETB) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., 499"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Compare Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={product.compare_price || ''}
                onChange={(e) => setProduct({ ...product, compare_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Original price (e.g., 699)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Type *</label>
              <select
                required
                value={product.service_type}
                onChange={(e) => setProduct({ ...product, service_type: e.target.value, category: '', sub_category: null })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Service Type</option>
                {serviceTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.icon} {type.display_name}
                  </option>
                ))}
              </select>
              {selectedServiceType && (
                <p className="text-xs text-gray-400 mt-1">Selected: {selectedServiceType.display_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                required
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value, sub_category: null })}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!product.service_type}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.display_name}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <p className="text-xs text-gray-400 mt-1">Selected: {selectedCategory.display_name}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sub-Category</label>
              <select
                value={product.sub_category || ''}
                onChange={(e) => setProduct({ ...product, sub_category: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!product.category}
              >
                <option value="">None</option>
                {subCategories.map(sub => (
                  <option key={sub.id} value={sub.name}>
                    {sub.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Badge (Optional)</label>
              <input
                type="text"
                value={product.badge || ''}
                onChange={(e) => setProduct({ ...product, badge: e.target.value || null })}
                placeholder="e.g., Best Seller, New Arrival"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Badge Color</label>
              <select
                value={product.badge_color || ''}
                onChange={(e) => setProduct({ ...product, badge_color: e.target.value || null })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">None</option>
                <option value="bg-orange">Orange</option>
                <option value="bg-green">Green</option>
                <option value="bg-royal-blue">Blue</option>
                <option value="bg-magenta">Magenta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <input
                type="text"
                value={product.material || ''}
                onChange={(e) => setProduct({ ...product, material: e.target.value || null })}
                placeholder="e.g., 100% Cotton"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Quantity</label>
              <input
                type="number"
                value={product.min_quantity}
                onChange={(e) => setProduct({ ...product, min_quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.in_stock}
                  onChange={(e) => setProduct({ ...product, in_stock: e.target.checked })}
                />
                In Stock
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={product.is_featured}
                  onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })}
                />
                Featured Product
              </label>
            </div>
          </div>

          {/* Full Width - Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={4}
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value || null })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Product description..."
            />
          </div>

          {/* Full Width - Image Upload Section */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Images</label>
            
            <div className="mb-3">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleImageSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-royal-blue-dark"
              />
              {uploading && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-royal-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Max file size: 5MB. Allowed formats: JPG, PNG, WEBP
              </p>
            </div>

            <div className="flex gap-3 flex-wrap mt-3">
              {product.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`http://localhost:8000${img}`}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              {product.images.length === 0 && !uploading && (
                <div className="text-sm text-gray-400 border-2 border-dashed rounded-lg p-8 text-center">
                  No images uploaded. Click above to add product images.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-4 py-2 bg-royal-blue text-white rounded-lg hover:bg-royal-blue-dark disabled:opacity-50"
          >
            {loading ? 'Saving...' : uploading ? 'Uploading Images...' : (id ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;