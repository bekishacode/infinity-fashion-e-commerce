// src/services/adminService.ts

import { apiClient, getImageUrl } from '../utils/apiClient';
import { 
  ApiResponse, 
  ServiceType, 
  Category, 
  SubCategory, 
  Product, 
  ProductFormData,
  UploadResponse 
} from '../types/api.types';

// Re-export getImageUrl for convenience
export { getImageUrl };

export const adminService = {
  // Auth
  async login(username: string, password: string): Promise<ApiResponse<{ admin: any; token: string }>> {
    return apiClient.post('/admin/login.php', { username, password });
  },

  // Products
  async getProducts(params?: { page?: number; limit?: number; search?: string; show_inactive?: boolean }): Promise<ApiResponse<{ products: Product[]; pagination: any }>> {
    return apiClient.get('/admin/products.php', params);
  },

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient.get(`/admin/products.php?id=${id}`);
  },

  async createProduct(product: ProductFormData): Promise<ApiResponse<{ id: number; slug: string }>> {
    return apiClient.post('/admin/products.php', product);
  },

  async updateProduct(id: number, product: ProductFormData): Promise<ApiResponse<null>> {
    return apiClient.put(`/admin/products.php?id=${id}`, product);
  },

  async deleteProduct(id: number, permanent: boolean = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/admin/products.php?id=${id}&permanent=${permanent}`);
  },

  async restoreProduct(id: number): Promise<ApiResponse<null>> {
    return apiClient.post(`/admin/products.php?id=${id}`, { action: 'restore' });
  },

  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    return apiClient.upload('/admin/upload-image.php', file);
  },

  // Picklist Management
  async getServiceTypes(): Promise<ApiResponse<ServiceType[]>> {
    return apiClient.get('/admin/picklists.php?type=service-types');
  },

  async getCategories(serviceTypeId?: number): Promise<ApiResponse<Category[]>> {
    const url = serviceTypeId 
      ? `/admin/picklists.php?type=categories&service_type_id=${serviceTypeId}`
      : '/admin/picklists.php?type=categories';
    return apiClient.get(url);
  },

  async getSubCategories(categoryId?: number): Promise<ApiResponse<SubCategory[]>> {
    const url = categoryId 
      ? `/admin/picklists.php?type=sub-categories&category_id=${categoryId}`
      : '/admin/picklists.php?type=sub-categories';
    return apiClient.get(url);
  },

  // Orders Related
  async getOrders(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string;
  }) {
    return apiClient.get('/admin/orders.php', params);
  },

  async getOrder(id: number) {
    return apiClient.get(`/admin/orders.php?id=${id}`);
  },

  async updateOrderStatus(orderId: number, status: string) {
    return apiClient.put('/orders/update.php', { order_id: orderId, status });
  },

  // Customer
  async getCustomers(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    sort_by?: string;
    sort_order?: string;
  }) {
    return apiClient.get('/admin/customers.php', params);
  },

  async getCustomer(id: number) {
    return apiClient.get(`/admin/customers.php?id=${id}`);
  },

  async updateCustomer(id: number, data: { name?: string; phone?: string; email?: string; address?: string }) {
    return apiClient.put(`/admin/customers.php?id=${id}`, data);
  },
  
  // Admin Management (Super Admin only)
  async getAdmins(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient.get('/admin/manage.php', params);
  },

  async getAdmin(id: number) {
    return apiClient.get(`/admin/manage.php?id=${id}`);
  },

  async createAdmin(data: { username: string; email: string; password: string; full_name?: string; role?: string }) {
    return apiClient.post('/admin/manage.php', data);
  },

  async updateAdmin(id: number, data: { full_name?: string; role?: string; is_active?: boolean; password?: string }) {
    return apiClient.put(`/admin/manage.php?id=${id}`, data);
  },

  async deleteAdmin(id: number) {
    return apiClient.delete(`/admin/manage.php?id=${id}`);
  },

  // Forgot Password
  async forgotPassword(email: string) {
    return apiClient.post('/admin/forgot-password.php', { email });
  },

  async verifyOtp(email: string, otp: string) {
    return apiClient.post('/admin/verify-otp.php', { email, otp });
  },

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    return apiClient.post('/admin/reset-password.php', { email, reset_token: resetToken, new_password: newPassword });
  },

  // Email Configuration
  async getEmailConfig() {
    return apiClient.get('/admin/email-config.php');
  },

  async updateEmailConfig(config: any) {
    return apiClient.put('/admin/email-config.php', config);
  },

  // Email Templates
  async getEmailTemplates() {
    return apiClient.get('/admin/email-templates.php');
  },

  async getEmailTemplate(id: number) {
    return apiClient.get(`/admin/email-templates.php?id=${id}`);
  },

  async updateEmailTemplate(id: number, data: { subject: string; body: string; is_active: boolean }) {
    return apiClient.put('/admin/email-templates.php', { id, ...data });
  },

  async testEmail(email: string) {
    return apiClient.post('/admin/email-templates.php?action=test', { email });
  },

  async getEmailTemplateFull(id: number) {
    return apiClient.get(`/admin/email-templates.php?id=${id}`);
  },

  async updateEmailTemplateFull(id: number, data: { subject: string; header: string; body: string; footer: string; is_active: boolean }) {
    return apiClient.put('/admin/email-templates.php', { id, ...data });
  },

  async getEmailLayoutSettings() {
    return apiClient.get('/admin/email-templates.php?action=layout');
  },

  async updateEmailLayoutSettings(data: any) {
    return apiClient.put('/admin/email-templates.php?action=layout', data);
  },

  async previewEmail(header: string, body: string, footer: string) {
    return apiClient.post('/admin/email-templates.php?action=preview', { header, body, footer });
  },

  async createServiceType(data: { name: string; display_name: string; icon?: string; sort_order?: number }) {
    return apiClient.post('/admin/picklists.php?type=service-types', data);
  },

  async createCategory(data: { service_type_id: number; name: string; display_name: string; icon?: string; sort_order?: number }) {
    return apiClient.post('/admin/picklists.php?type=categories', data);
  },

  async createSubCategory(data: { category_id: number; name: string; display_name: string; sort_order?: number }) {
    return apiClient.post('/admin/picklists.php?type=sub-categories', data);
  },

  async updateServiceType(id: number, data: { display_name: string; icon?: string; sort_order?: number; is_active?: boolean }) {
    return apiClient.put(`/admin/picklists.php?type=service-types&id=${id}`, data);
  },

  async updateCategory(id: number, data: { display_name: string; icon?: string; sort_order?: number; is_active?: boolean }) {
    return apiClient.put(`/admin/picklists.php?type=categories&id=${id}`, data);
  },

  async updateSubCategory(id: number, data: { display_name: string; sort_order?: number; is_active?: boolean }) {
    return apiClient.put(`/admin/picklists.php?type=sub-categories&id=${id}`, data);
  },

  async deleteServiceType(id: number) {
    return apiClient.delete(`/admin/picklists.php?type=service-types&id=${id}`);
  },

  async deleteCategory(id: number) {
    return apiClient.delete(`/admin/picklists.php?type=categories&id=${id}`);
  },

  async deleteSubCategory(id: number) {
    return apiClient.delete(`/admin/picklists.php?type=sub-categories&id=${id}`);
  },

  // Manual Image clean-up
  async scanOrphanedImages() {
    return apiClient.get('/admin/cleanup-images.php?action=scan');
  },

  async deleteOrphanedImages() {
    return apiClient.delete('/admin/cleanup-images.php');
  },

  // OTP Cleanup
  async scanExpiredOtps(hours: number = 1) {
    return apiClient.get(`/admin/cleanup-otp.php?action=scan&hours=${hours}`);
  },

  async deleteExpiredOtps(hours: number = 1) {
    return apiClient.delete(`/admin/cleanup-otp.php?hours=${hours}`);
  },

  // Upload profile image
  async uploadProfileImage(file: File) {
    return apiClient.upload('/admin/upload-profile-image.php', file);
  },

  // Update admin profile (for own profile)
  async updateMyProfile(data: { full_name: string; current_password?: string; new_password?: string }) {
    return apiClient.put('/admin/profile.php', data);
  },
  // Add this method to your adminService class
  async getDashboardStats(period: 'today' | 'week' | 'month' | 'year' = 'today'): Promise<ApiResponse<any>> {
    return apiClient.get(`/admin/dashboard.php?period=${period}`);
  },
  async logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  },
};