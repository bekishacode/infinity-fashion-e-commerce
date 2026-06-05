const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const adminService = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  async getProducts(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    show_inactive?: boolean;  // Changed from 'status' to 'show_inactive'
  }) {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.search) urlParams.append('search', params.search);
    
    // Handle show_inactive parameter
    if (params?.show_inactive !== undefined) {
      urlParams.append('show_inactive', params.show_inactive ? 'true' : 'false');
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/products.php?${urlParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getProduct(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/products.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createProduct(product: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/products.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return response.json();
  },

  async updateProduct(id: number, product: any) {
    const response = await fetch(`${API_BASE_URL}/admin/products.php?id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return response.json();
  },

  async deleteProduct(id: number, permanent: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/admin/products.php?id=${id}&permanent=${permanent}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async restoreProduct(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/products.php?id=${id}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action: 'restore' })
    });
    return response.json();
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}/admin/upload-image.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  async logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  },
};