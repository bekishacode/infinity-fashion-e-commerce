// Use environment variable for API URL
// For Vercel: Set REACT_APP_API_URL in environment variables
// For local: Defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);

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
    
    // This will use the environment variable value in production
    const url = `${API_BASE_URL}/products/index.php?${params}`;
    console.log('Fetching from URL:', url);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        return { data: [], total: 0 };
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.data) {
        return { data: result.data, total: result.total || result.data.length };
      }
      
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], total: 0 };
    }
  },

  async getProduct(id: number): Promise<Product | null> {
    const url = `${API_BASE_URL}/products/get.php?id=${id}`;
    console.log('Fetching product from URL:', url);
    
    try {
      const response = await fetch(url);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
};