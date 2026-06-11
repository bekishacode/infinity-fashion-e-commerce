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

  // Orders Related
  async getOrders(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
  }) {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.status) urlParams.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/admin/orders.php?${urlParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getOrder(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/orders.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateOrderStatus(orderId: number, status: string) {
    const response = await fetch(`${API_BASE_URL}/orders/update.php`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ order_id: orderId, status })
    });
    return response.json();
  },

  //Customer
  async getCustomers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sort_by?: string;
    sort_order?: string;
  }) {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.search) urlParams.append('search', params.search);
    if (params?.sort_by) urlParams.append('sort_by', params.sort_by);
    if (params?.sort_order) urlParams.append('sort_order', params.sort_order);
    
    const response = await fetch(`${API_BASE_URL}/admin/customers.php?${urlParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getCustomer(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/customers.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateCustomer(id: number, data: { name?: string; phone?: string; email?: string; address?: string }) {
    const response = await fetch(`${API_BASE_URL}/admin/customers.php?id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  // Admin Management (Super Admin only)
  async getAdmins(params?: { page?: number; limit?: number; search?: string }) {
    const urlParams = new URLSearchParams();
    if (params?.page) urlParams.append('page', params.page.toString());
    if (params?.limit) urlParams.append('limit', params.limit.toString());
    if (params?.search) urlParams.append('search', params.search);
    
    const response = await fetch(`${API_BASE_URL}/admin/manage.php?${urlParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getAdmin(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/manage.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createAdmin(data: { username: string; email: string; password: string; full_name?: string; role?: string }) {
    const response = await fetch(`${API_BASE_URL}/admin/manage.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateAdmin(id: number, data: { full_name?: string; role?: string; is_active?: boolean; password?: string }) {
    const response = await fetch(`${API_BASE_URL}/admin/manage.php?id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteAdmin(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/manage.php?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Forgot Password
  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/admin/forgot-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  async verifyOtp(email: string, otp: string) {
    const response = await fetch(`${API_BASE_URL}/admin/verify-otp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return response.json();
  },

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/admin/reset-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword })
    });
    return response.json();
  },

  // Email Configuration
  async getEmailConfig() {
    const response = await fetch(`${API_BASE_URL}/admin/email-config.php`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateEmailConfig(config: any) {
    const response = await fetch(`${API_BASE_URL}/admin/email-config.php`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return response.json();
  },

  // Email Templates
  async getEmailTemplates() {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getEmailTemplate(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateEmailTemplate(id: number, data: { subject: string; body: string; is_active: boolean }) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...data })
    });
    return response.json();
  },

  async testEmail(email: string) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?action=test`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  // Get single template with full details
  async getEmailTemplateFull(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?id=${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateEmailTemplateFull(id: number, data: { subject: string; header: string; body: string; footer: string; is_active: boolean }) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...data })
    });
    return response.json();
  },

  async getEmailLayoutSettings() {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?action=layout`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async updateEmailLayoutSettings(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?action=layout`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async previewEmail(header: string, body: string, footer: string) {
    const response = await fetch(`${API_BASE_URL}/admin/email-templates.php?action=preview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ header, body, footer })
    });
    return response.json();
  },

  // Picklist Management
  async getServiceTypes() {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=service-types`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getCategories(serviceTypeId?: number) {
    const url = serviceTypeId 
      ? `${API_BASE_URL}/admin/picklists.php?type=categories&service_type_id=${serviceTypeId}`
      : `${API_BASE_URL}/admin/picklists.php?type=categories`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return response.json();
  },

  async getSubCategories(categoryId?: number) {
    const url = categoryId 
      ? `${API_BASE_URL}/admin/picklists.php?type=sub-categories&category_id=${categoryId}`
      : `${API_BASE_URL}/admin/picklists.php?type=sub-categories`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return response.json();
  },

  async createServiceType(data: { name: string; display_name: string; icon?: string; sort_order?: number }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=service-types`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async createCategory(data: { service_type_id: number; name: string; display_name: string; icon?: string; sort_order?: number }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async createSubCategory(data: { category_id: number; name: string; display_name: string; sort_order?: number }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=sub-categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateServiceType(id: number, data: { display_name: string; icon?: string; sort_order?: number; is_active?: boolean }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=service-types&id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateCategory(id: number, data: { display_name: string; icon?: string; sort_order?: number; is_active?: boolean }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=categories&id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateSubCategory(id: number, data: { display_name: string; sort_order?: number; is_active?: boolean }) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=sub-categories&id=${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteServiceType(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=service-types&id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async deleteCategory(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=categories&id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async deleteSubCategory(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin/picklists.php?type=sub-categories&id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },
  async logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  },
};