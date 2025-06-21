// 테스트 결과 타입
export interface TestResult {
  endpoint: string;
  method: string;
  status: number | null;
  data: any;
  error: string | null;
  timestamp: string;
}

// 인증 토큰 타입
export interface AuthTokens {
  accessToken: string | null;
  userId: string | null;
}

// 탭 타입 정의
export type TabType = "auth" | "user" | "business";

// 사업자 등록 폼 인터페이스 (업데이트됨)
export interface BusinessOwnerRegistrationForm {
  businessRegistrationImage: string;
}

// 사용자 업데이트 폼 인터페이스
export interface UserUpdateForm {
  nickname: string;
  userType: string;
}

// 개발 토큰 생성 요청 타입
export interface DevTokenRequest {
  userId?: string;
  nickname?: string;
}

// 로딩 상태 타입 (확장됨)
export type LoadingState =
  | "kakao-login"
  | "refresh"
  | "logout"
  | "dev-token"
  | "dev-token-nickname"
  | "my-info"
  | "update-info"
  | "select-type"
  | "business-profile"
  | "verification-status"
  | "dashboard"
  | "statistics"
  | "notifications"
  | "settings"
  | "business-registration"
  | null;

// 탭 정보 타입
export interface TabInfo {
  id: TabType;
  name: string;
  description: string;
}

// API 응답 공통 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 사용자 타입 옵션
export type UserType = "PART_TIME_JOB" | "BUSINESS_OWNER";

// 검증 상태 타입 (새로 추가)
export type VerificationStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "VERIFIED";

// 검증 타임라인 항목 타입 (새로 추가)
export interface TimelineItem {
  timestamp: string;
  status: string;
  action: string;
  description: string;
  adminId?: string;
  adminName?: string;
}

// 사업자 프로필 타입 (새로 추가)
export interface BusinessOwnerProfile {
  user: {
    id: number;
    username: string;
    userType: string;
    createdAt: string;
  };
  businessOwner: {
    id: number;
    businessNumber: string;
    businessName: string;
    ownerName: string;
    phoneNumber?: string;
    email?: string;
    verificationStatus: VerificationStatus;
    registeredAt: string;
    verifiedAt?: string;
  } | null;
  isRegistered: boolean;
  isVerified: boolean;
}

// 대시보드 데이터 타입 (확장됨)
export interface DashboardData {
  user: {
    id: number;
    username: string;
    userType: string;
    createdAt: string;
  };
  businessOwner:
    | {
        id: number;
        businessNumber: string;
        businessName: string;
        ownerName: string;
        phoneNumber?: string;
        email?: string;
        verificationStatus: VerificationStatus;
        registeredAt: string;
        verifiedAt?: string;
      }
    | { status: string };
  verification: {
    isRegistered: boolean;
    isVerified: boolean;
    status: VerificationStatus | "NONE";
    canRegister: boolean;
  };
  workplace?: {
    statistics: {
      totalCount: number;
      activeCount: number;
    };
    mainWorkplace: any | null;
    hasMainWorkplace: boolean;
  };
}

// Auth 관련 타입들
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: number;
    username: string;
    userType: string;
  };
}

// 사업자 등록 테스트 요청
export interface BusinessOwnerTestRequest {
  businessNumber: string;
  businessName?: string;
  ownerName?: string;
}

// 사업자 정보 응답
export interface BusinessOwnerInfo {
  id: number;
  businessName: string;
  ownerName: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessType: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 파일 업로드 관련
export interface FileUploadResponse {
  success: boolean;
  fileName?: string;
  fileUrl?: string;
  error?: string;
}

// 검증 상태 응답
export interface VerificationStatusResponse {
  isRegistered: boolean;
  isVerified: boolean;
  verificationStatus: string;
  canRegister: boolean;
}
