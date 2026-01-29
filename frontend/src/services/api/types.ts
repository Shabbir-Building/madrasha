type ApiError = {
  status: number;
  statusText: string;
  message?: string;
};

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
};

type CacheConfig = {
  cache?: boolean | 'force-cache' | 'no-store';
  revalidate?: number | false;
  tags?: string[];
};

type FetchOptions = {
  throw?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  params?: Record<string, string | number>;
  cache?: RequestCache;
  accessToken?: string;
};

type PaginationResult<T> = {
  docs: T[];
  total: number;
  totalAmount?: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type { ApiError, ApiResponse, CacheConfig, FetchOptions, PaginationResult };
