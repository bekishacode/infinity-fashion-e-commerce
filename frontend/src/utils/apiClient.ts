// src/utils/apiClient.ts

import { ApiResponse } from '../types/api.types';
import { loadingManager } from './loadingManager';

// ============================================
// FIX: Use your production URL as default
// ============================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://stylebadgetex.com';
const ASSET_BASE_URL = process.env.REACT_APP_ASSET_URL || 'https://stylebadgetex.com';

type LoadingKey = string;

class ApiClient {
  private baseUrl: string;
  private loadingCallbacks: Map<LoadingKey, (loading: boolean) => void> = new Map();
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Register a loading callback for a specific component
  registerLoadingCallback(key: LoadingKey, callback: (loading: boolean) => void) {
    this.loadingCallbacks.set(key, callback);
  }

  // Unregister loading callback
  unregisterLoadingCallback(key: LoadingKey) {
    this.loadingCallbacks.delete(key);
  }

  private setLoading(loading: boolean, requestKey?: string) {
    if (requestKey) {
      const callback = this.loadingCallbacks.get(requestKey);
      if (callback) {
        callback(loading);
      }
    }
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${ASSET_BASE_URL}${path}`;
  }

  // Cancel an in-progress request
  cancelRequest(requestKey: string) {
    const controller = this.activeRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }
  }

  // Cancel all pending requests
  cancelAllRequests() {
    this.activeRequests.forEach((controller, key) => {
      controller.abort();
      this.activeRequests.delete(key);
    });
  }

  // ============================================
  // FIX: Added skipAuth parameter
  // ============================================
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    // Remove .php extension if present
    endpoint = endpoint.replace(/\.php/g, '');

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // ============================================
    // FIX: Only add Content-Type if not FormData
    // ============================================
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // ============================================
    // FIX: Only add Authorization if:
    // 1. Token exists
    // 2. skipAuth is false (not skipping auth)
    // ============================================
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for cancellation
    const controller = new AbortController();
    if (requestKey) {
      // Cancel previous request with same key if exists
      this.cancelRequest(requestKey);
      this.activeRequests.set(requestKey, controller);
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    this.setLoading(true, requestKey);
    loadingManager.start();

    try {
      const response = await fetch(url, config);
      
      // ============================================
      // FIX: Better error handling for non-JSON responses
      // ============================================
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (requestKey) {
        this.activeRequests.delete(requestKey);
      }
      
      // Return the response directly - let the caller handle success/failure
      return data as ApiResponse<T>;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled - don't treat as error
        return { success: false, message: 'Request cancelled', data: null as any };
      }
      throw error;
    } finally {
      this.setLoading(false, requestKey);
      loadingManager.stop();
    }
  }

  // ============================================
  // FIX: All methods now accept skipAuth parameter
  // ============================================

  async get<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' }, requestKey, skipAuth);
  }

  async post<T>(
    endpoint: string, 
    data?: any, 
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'POST' };
    if (data instanceof FormData) {
      options.body = data;
    } else if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, options, requestKey, skipAuth);
  }

  async put<T>(
    endpoint: string, 
    data?: any, 
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'PUT' };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, options, requestKey, skipAuth);
  }

  async delete<T>(
    endpoint: string, 
    data?: any, 
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'DELETE' };
    if (data) {
      options.body = JSON.stringify(data);
    }
    return this.request<T>(endpoint, options, requestKey, skipAuth);
  }

  async upload<T>(
    endpoint: string, 
    file: File, 
    requestKey?: string,
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.post<T>(endpoint, formData, requestKey, skipAuth);
  }
}

// ============================================
// Export with production URL as default
// ============================================
export const apiClient = new ApiClient(API_BASE_URL);
export const getImageUrl = (path: string | null | undefined): string | null => apiClient.getImageUrl(path);
export default apiClient;