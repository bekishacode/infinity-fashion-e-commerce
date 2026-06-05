// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export interface Product {
  id: number;
  name: string;
  price: number;
  icon: string | null;
  images: string[];
  service_type: 'wholesale' | 'retail' | 'pod';  // Changed from serviceType
  category: string;
  badge?: string | null;
  badge_color?: string | null;  // Changed from badgeColor
  rating?: number;
  review_count?: number;  // Changed from reviewCount
  compare_price?: number | null;  // Changed from originalPrice
  min_quantity?: number;  // Changed from minQuantity
  description?: string | null;
  material?: string | null;
  in_stock?: boolean;  // Changed from inStock
  is_featured?: boolean;  // Changed from isFeatured
  variants?: ProductVariant[];
}

export interface ProductVariant {
  size: string;
  color: string;
  color_code: string | null;
  price_adjustment: number;
  stock_quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export const productService = {
  // Get all products with filters and pagination
  async getProducts(filters: {
    service?: string;
    category?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value.toString());
      }
    });
    
    const url = `${API_BASE_URL}/products/index.php${params.toString() ? '?' + params.toString() : ''}`;
    console.log('Fetching products:', url);
    
    try {
      const response = await fetch(url);
      const result: ApiResponse<ProductsResponse> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return { products: [] };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [] };
    }
  },

  // Get single product by ID
  async getProduct(id: number): Promise<Product | null> {
    const url = `${API_BASE_URL}/products/get.php?id=${id}`;
    console.log('Fetching product:', url);
    
    try {
      const response = await fetch(url);
      const result: ApiResponse<Product> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get products by service type (retail, wholesale, pod)
  async getProductsByService(service: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return this.getProducts({ service, page, limit });
  },

  // Get products by category
  async getProductsByCategory(category: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return this.getProducts({ category, page, limit });
  },

  // Search products
  async searchProducts(query: string, page: number = 1, limit: number = 20): Promise<ProductsResponse> {
    return this.getProducts({ search: query, page, limit });
  },

  // Get featured products
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const result = await this.getProducts({ limit });
    return result.products || [];
  }
};