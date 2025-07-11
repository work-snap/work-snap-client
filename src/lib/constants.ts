// Query Keys
export const QUERY_KEYS = {
  ADDITIONAL_WORK: "additional-work",
  ATTENDANCE: "attendance",
  USER_PROFILE: "user-profile",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ATTENDANCE: "/api/v1/attendance",
  ADDITIONAL_WORK: "/api/v1/attendance/additional",
  AUTH: "/api/v1/auth",
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  THEME: "worksnap-theme",
  LANGUAGE: "worksnap-language",
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: "ERR_UNAUTHORIZED",
  VALIDATION: "ERR_VALIDATION",
  SERVER: "ERR_SERVER",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "필수 입력 항목입니다.",
  INVALID_DATE: "올바른 날짜를 입력해주세요.",
  INVALID_TIME: "올바른 시간을 입력해주세요.",
  INVALID_RANGE: "시작 시간은 종료 시간보다 이전이어야 합니다.",
  DESCRIPTION_TOO_LONG: "설명은 500자를 초과할 수 없습니다.",
} as const;

// Cookie Names
export const COOKIE_NAMES = {
  REFRESH_TOKEN: "refreshToken",
  THEME: "theme",
} as const;

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  USER_PREFERENCES: "userPreferences",
} as const;
