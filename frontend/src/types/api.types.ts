// src/types/api.types.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Service Types
export interface ServiceType {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

// Category Types
export interface Category {
  id: number;
  service_type_id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  service_type_name?: string;
}

// SubCategory Types
export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  display_name: string;
  sort_order: number;
  is_active: boolean;
  category_name?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  icon: string | null;
  service_type: string;
  category: string;
  sub_category: string | null;
  badge: string | null;
  badge_color: string | null;
  rating: number;
  review_count: number;
  min_quantity: number;
  description: string | null;
  material: string | null;
  care_instructions: string | null;
  weight: number | null;
  in_stock: number;
  is_featured: number;
  is_active: number;
  images: string[];
  primary_image?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
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

// Upload Response
export interface UploadResponse {
  image_url: string;
}
// Login Response
export interface LoginResponse {
  token: string;
  admin: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    profile_image?: string | null;
  };
}

// Forgot Password Response
export interface ForgotPasswordResponse {
  message: string;
}

// Verify OTP Response
export interface VerifyOtpResponse {
  reset_token: string;
}

// Email Layout Settings Response
export interface EmailLayoutSettings {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  website_url: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
}

// Orphaned Images Scan Response
export interface OrphanedImageScanResponse {
  total_files_scanned: number;
  orphaned_files_count: number;
  orphaned_files_size_mb: number;
  orphaned_files: Array<{
    filename: string;
    path: string;
    size: number;
    size_mb: number;
    modified: string;
  }>;
  database_images_count: number;
  has_orphaned_files: boolean;
}

// Orphaned Images Delete Response
export interface OrphanedImageDeleteResponse {
  orphaned_files_deleted: number;
  deleted_files: string[];
  freed_space_mb: number;
  database_images_count: number;
}

// OTP Scan Response
export interface OtpScanResponse {
  expired_count: number;
  expired_otps: Array<{
    id: number;
    admin_id: number;
    otp: string;
    expires_at: string;
    created_at: string;
    used: number;
    minutes_old: number;
  }>;
  stats: {
    total_otps: number;
    used_count: number;
    active_count: number;
    oldest_otp: string;
    newest_otp: string;
  };
  has_expired: boolean;
  hours_threshold: number;
}

// OTP Delete Response
export interface OtpDeleteResponse {
  deleted_count: number;
  hours_threshold: number;
}