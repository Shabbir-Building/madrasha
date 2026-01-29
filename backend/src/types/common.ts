// Standardized API response types
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
};

// Pagination query parameters
export type PaginationQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
};

// Paginated response
export type PaginationResult<T> = {
  docs: T[];
  total: number;
  totalAmount?: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Error response format
export type ErrorResponse = {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
};

// Database document base type
export type BaseDocument = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

// File upload types
export type FileUpload = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

// Storage service types
export type StorageService = {
  upload: (file: Buffer, path: string) => Promise<string>;
  delete: (url: string) => Promise<void>;
  getSignedUrl: (key: string) => Promise<string>;
};
