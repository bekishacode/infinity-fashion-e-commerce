import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

interface ProductFormData {
  name: string;
  price: number;
  compare_price: number | null;
  service_type: 'retail' | 'wholesale' | 'pod';
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

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [product, setProduct] = useState<ProductFormData>({
    name: '',
    price: 0,
    compare_price: null,
    service_type: 'retail',
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

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const result = await adminService.getProduct(parseInt(id!));
      if (result.success) {
        setProduct(result.data);
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

  // Handle image file selection and upload
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
          // Update state immediately to show preview
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
        // Show success message
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

  if (loading && id) {
    return <div className="text-center py-8">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <h1 className="text-2xl font-bold text-charcoal mb-6">
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
                onChange={(e) => setProduct({ ...product, service_type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="pod">Print on Demand (POD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <input
                type="text"
                required
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                placeholder="e.g., t-shirts, caps, hoodies"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
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
            
            {/* Image Upload Button */}
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

           {/* Image Gallery */}
            <div className="flex gap-3 flex-wrap mt-3">
              {product.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`http://localhost:8000${img}`}
                    alt={`Product ${index + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                    onError={(e) => {
                      console.error('Image failed to load:', `http://localhost:8000${img}`);
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

        {/* Submit Buttons */}
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