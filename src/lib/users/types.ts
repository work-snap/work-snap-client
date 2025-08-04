// 사용자 관련 타입 정의

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profileImage?: string;
  phoneNumber?: string;
  fullName?: string;
}

export type UserRole = "ADMIN" | "BUSINESS_OWNER" | "PART_TIME_WORKER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

// API 요청/응답 타입
export interface UsersListRequest {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "createdAt" | "username" | "email" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface UsersListResponse {
  success: boolean;
  data: {
    users: User[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  message?: string;
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
  message?: string;
}

// 사용자 생성 요청
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  phoneNumber?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

// 사용자 수정 요청
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  fullName?: string;
  phoneNumber?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

// 사용자 삭제 응답
export interface DeleteUserResponse {
  success: boolean;
  message?: string;
}

// 사용자 통계
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  adminCount: number;
  businessOwnerCount: number;
  partTimeWorkerCount: number;
  newUsersThisMonth: number;
  lastLoginToday: number;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
  message?: string;
}

// 사용자 필터 옵션
export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// 페이지네이션 정보
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}