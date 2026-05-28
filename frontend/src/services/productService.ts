const API_BASE_URL = 'http://localhost:8000/api/v1';//http://localhost:8000/api/v1
//https://infinity-fashion-e-commerce.onrender.com
export interface Product {
  id: number;
  name: string;
  price: number;
  icon: string;
  serviceType: 'wholesale' | 'retail' | 'pod';
  category: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  minQuantity?: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
}

export const productService = {
  async getProducts(filters: {
    service?: string;
    category?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }): Promise<{ data: Product[]; total: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/products/index.php?${params}`);
    const result = await response.json();
    
    // Handle different response formats
    if (result.success && result.data) {
      return { data: result.data, total: result.total || result.data.length };
    }
    
    // Fallback for direct data response
    if (Array.isArray(result)) {
      return { data: result, total: result.length };
    }
    
    // If data is in result.data
    if (result.data && Array.isArray(result.data)) {
      return { data: result.data, total: result.data.length };
    }
    
    // Empty fallback
    return { data: [], total: 0 };
  },

  async getProduct(id: number): Promise<Product | null> {
    const response = await fetch(`${API_BASE_URL}/products/get.php?id=${id}`);
    const result = await response.json();
    return result.success ? result.data : null;
  }
};