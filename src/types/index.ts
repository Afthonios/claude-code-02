// Core application types for Afthonios e-learning platform

export type Locale = 'fr' | 'en';

export interface LocalizedString {
  fr: string;
  en: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  locale: Locale;
  createdAt: string;
  updatedAt: string;
}

// Course types
export interface Course {
  id: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  title: LocalizedString;
  subtitle?: LocalizedString;
  summary: LocalizedString;
  description: LocalizedString;
  coverImage?: DirectusFile;
  gallery?: DirectusFile[];
  durationMinutes: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  priceCents: number;
  currency: string;
  availability: 'free' | 'paid' | 'subscription';
  competences: Competence[];
  instructors?: Instructor[];
  // SEO fields
  seoTitle?: LocalizedString;
  seoDescription?: LocalizedString;
  ogImage?: DirectusFile;
  // Timestamps
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Competence types
export interface Competence {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  icon?: string;
  color?: string;
  category?: string;
}

// Instructor types
export interface Instructor {
  id: string;
  name: string;
  bio?: LocalizedString;
  avatar?: DirectusFile;
  expertise: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// File types for Directus
export interface DirectusFile {
  id: string;
  filename_disk: string;
  filename_download: string;
  title?: string;
  description?: string;
  type: string;
  width?: number;
  height?: number;
  filesize: number;
  uploaded_on: string;
}

// Payment and entitlement types
export interface UserEntitlement {
  id: string;
  userId: string;
  courseId: string;
  type: 'course_purchase' | 'subscription';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  createdAt: string;
}

// Search and filtering types
export interface CourseFilters {
  search?: string;
  level?: Course['level'];
  competences?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
  price?: {
    free?: boolean;
    min?: number;
    max?: number;
  };
  availability?: Course['availability'];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Form types for authentication
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

// Navigation and UI types
export interface NavItem {
  label: LocalizedString;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: LocalizedString;
  href?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Course content types (for future expansion)
export interface CourseModule {
  id: string;
  courseId: string;
  title: LocalizedString;
  description?: LocalizedString;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: LocalizedString;
  description?: LocalizedString;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content: Record<string, unknown>; // Will be defined based on lesson type
  durationMinutes?: number;
  order: number;
  isPreview: boolean;
}