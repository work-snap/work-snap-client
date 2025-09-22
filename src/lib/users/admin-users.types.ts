// 서버 API에 맞춘 새로운 관리자용 유저 타입 정의

export type UserType = 'PENDING' | 'BUSINESS_OWNER' | 'PART_TIME_WORKER';
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type VerificationStatus = 'NOT_REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWING' | 'VERIFIED';

export interface AdminUserSummary {
  id: number;
  nickname: string;
  email: string;
  phoneNumber?: string;
  userType: UserType;
  userRole: UserRole;
  verificationStatus?: VerificationStatus; // 사업자만
  businessName?: string;                   // 사업자만
  createdAt: string;
  isActive: boolean;
}

export interface BusinessOwnerDetail {
  id: number;
  businessName?: string;
  ownerName?: string;
  businessAddress?: string;
  businessRegistrationNumber?: string;
  businessType?: string;
  verificationStatus: VerificationStatus;
  employeeCount?: number;
  businessDescription?: string;
  verificationRequestedAt?: string;
  verificationCompletedAt?: string;
  verificationProcessedBy?: string;
  verificationRejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  workplaceCount: number;        // 소속 사업장 수
  attendanceCount: number;       // 출근 기록 수
  scheduleCount: number;         // 스케줄 수
  lastActivityAt?: string;       // 마지막 활동 시간
}

export interface AdminUserDetail {
  user: {
    id: number;
    kakaoId: string;
    nickname: string;
    profileImageUrl?: string;
    email: string;
    phoneNumber?: string;
    fcmToken?: string;
    userType: UserType;
    userRole: UserRole;
    createdAt: string;
    updatedAt: string;
  };
  businessOwner?: BusinessOwnerDetail;
  statistics: UserStatistics;
}

export interface CursorPagination {
  nextCursor?: string;      // 다음 페이지 커서
  hasMore: boolean;         // 더 많은 데이터가 있는지 여부
  totalCount?: number;      // 전체 데이터 개수 (첫 페이지에서만)
  currentCount: number;     // 현재 반환된 데이터 개수
}

export interface AdminUserListResponse {
  users: AdminUserSummary[];
  pagination: CursorPagination;
}

export interface AdminUserListRequest {
  cursor?: string;              // createdAt 커서
  limit?: number;               // 한 번에 가져올 데이터 개수 (기본 20, 최대 100)
  search?: string;              // 이름/이메일 검색
  userType?: UserType;          // 유저 타입 필터
  userRole?: UserRole;          // 유저 권한 필터
  verificationStatus?: VerificationStatus; // 사업자 인증 상태 필터
}

export interface AdminUserUpdateRequest {
  nickname?: string;
  email?: string;
  phoneNumber?: string;
  userType?: UserType;
  userRole?: UserRole;
  // 사업자 정보 (userType이 BUSINESS_OWNER인 경우)
  businessOwner?: {
    businessName?: string;
    ownerName?: string;
    businessAddress?: string;
    businessRegistrationNumber?: string;
    businessType?: string;
    verificationStatus?: VerificationStatus;
    employeeCount?: number;
    businessDescription?: string;
    verificationRejectionReason?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}