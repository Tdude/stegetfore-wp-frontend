// src/lib/types/apiTypes.ts

/**
 * Common base interface for API responses
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
}

/**
 * Pagination information returned by the WordPress REST API
 */
export interface ApiPagination {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

/**
 * Base interface for paginated API responses
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPagination;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  data?: unknown;
  success: false;
}

/**
 * Common parameters for API requests with pagination
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

/**
 * Parameters for fetching posts
 */
export interface PostQueryParams extends PaginationParams {
  search?: string;
  categories?: number[];
  tags?: number[];
  orderBy?: "date" | "title" | "modified" | "relevance";
  order?: "asc" | "desc";
  author?: number;
  slug?: string;
  status?: "publish" | "draft" | "future" | "pending" | "private";
}

/**
 * Parameters for fetching pages
 */
export interface PageQueryParams extends PaginationParams {
  search?: string;
  parent?: number;
  orderBy?: "date" | "title" | "modified" | "menu_order";
  order?: "asc" | "desc";
  slug?: string;
  status?: "publish" | "draft" | "future" | "pending" | "private";
}

/**
 * Parameters for fetching modules
 */
export interface ModuleQueryParams extends PaginationParams {
  template?: string;
  category?: string;
  status?: "publish" | "draft";
}

/**
 * Parameters for form submissions
 */
export interface FormSubmissionParams {
  formId: number;
  formData: Record<string, string | File>;
}
