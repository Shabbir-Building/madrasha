// Database configuration constants
export const DATABASE_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 5000;

// User roles
export enum UserRole {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  MODERATOR = 3,
}

// Employee roles
export enum EmployeeType {
  ADMINISTRATION = 1,
  TEACHER = 2,
  MEDIA_IT = 3,
  STAFF = 4,
}

// Employee designations
export enum Designation {
  PRINCIPAL_HEAD_MUHTAMIM = 1,
  VICE_PRINCIPAL_NAIB_MUHTAMIM = 2,
  OFFICE_ADMINISTRATOR = 3,
  ACCOUNTANT = 4,
  SUBJECT_TEACHER = 5,
  GENERAL_SUBJECTS_TEACHER = 6,
  HIFZ_TEACHER = 7,
  ASSISTANT_TEACHER = 8,
  MUALLIM = 9,
  MUALLIMA = 10,
  DEVELOPER = 11,
  MEDIA_MANAGER = 12,
  COMPUTER_OPERATOR = 13,
  PEON = 14,
  LIBRARIAN = 15,
  DRIVER = 16,
  COOK = 17,
  EDUCATION_SECRETARY = 18,
}

// Branch types
export enum Branch {
  ALL = 1,
  BOYS = 2,
  GIRLS = 3,
  HOSTELS = 4,
}

// Donation types
export enum DonationType {
  SADAQAH = 1,
  ZAKAT = 2,
  MEMBERSHIP = 3,
  OTHERS = 4,
}

// Income types
export enum IncomeType {
  ADMISSION_FEE = 1,
  SESSION_FEE = 2,
  STUDENTS_MONTHLY_FEE = 3,
  CANTEEN = 4,
  OTHERS = 5,
}

// Expense types
export enum ExpenseType {
  SALARY = 1,
  HOSTEL = 2,
  ELECTRICITY_BILL = 3,
  MOBILE_INTERNET_BILL = 4,
  OFFICE = 5,
  STATIONERY = 6,
  UTILITIES = 7,
  FARE = 8,
  MAINTENANCE = 9,
  CONSTRUCTION = 10,
}

// Student sections
export enum StudentSection {
  BOYS = "boys",
  GIRLS = "girls",
  MIXED = "mixed",
}

// Student classes/grades
export enum StudentClass {
  NURSERY = "nursery",
  KG1 = "kg1",
  KG2 = "kg2",
  GRADE_1 = "grade_1",
  GRADE_2 = "grade_2",
  GRADE_3 = "grade_3",
  GRADE_4 = "grade_4",
  GRADE_5 = "grade_5",
  GRADE_6 = "grade_6",
  GRADE_7 = "grade_7",
  GRADE_8 = "grade_8",
  GRADE_9 = "grade_9",
  GRADE_10 = "grade_10",
  GRADE_11 = "grade_11",
  GRADE_12 = "grade_12",
  HAFIZ_CLASS = "hafiz_class",
  QURAN_CLASS = "quran_class",
  ARABIC_CLASS = "arabic_class",
}

// HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// JWT configuration
export const JWT_CONFIG = {
  ALGORITHM: "HS256" as const,
  ISSUER: "madrasha-backend",
  AUDIENCE: "madrasha-frontend",
} as const;
