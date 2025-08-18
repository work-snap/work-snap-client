// 로그인 요청 타입
export interface KakaoLoginRequest {
  code: string;
  userType?: string;
  redirectUri?: string; // 프론트엔드에서 사용한 redirect_uri (환경에 따른 동적 처리용)
}

export const UserType = {
  BUSINESS_OWNER: "BUSINESS_OWNER",
  PART_TIME_WORKER: "PART_TIME_WORKER",
  PENDING: "PENDING",
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

export const UserRoleType = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  BUSINESS_OWNER: "BUSINESS_OWNER",
} as const;

export type UserRoleType = (typeof UserRoleType)[keyof typeof UserRoleType];

// 사용자 정보 타입
export interface User {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  email: string;
  phoneNumber?: string;
  userType: UserType;
  userRole: UserRoleType;
  createdAt: string;
  updatedAt: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  accessToken: string;
  user: User;
  isNewUser: boolean;
}

// 토큰 갱신 응답 타입
export interface RefreshTokenResponse {
  accessToken: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
  userType: "BUSINESS_OWNER" | "PART_TIME_WORKER";
  nickname: string;
}

// 회원가입 응답 타입
export interface SignupResponse {
  user: User;
}

// 프로필 업데이트 요청 타입
export interface UpdateProfileRequest {
  nickname?: string;
}

// 프로필 업데이트 응답 타입
export interface UpdateProfileResponse {
  user: User;
}

// API 공통 응답 타입
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// 에러 응답 타입
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
}

//초대 코드 생성 요청 타입
export interface CreateInvitationCodeRequest {
  success: boolean;
  data: {
    inviteCode: string;
    createdAt: string;
  };
  message: string;
}
export interface CreateInviteCodeResponse {
  inviteCode: string;
}
export interface ResisterBusinessRequest {
  businessRegistrationImage: string;
}

export interface ResisterBusinessResponse {
  id: number;
  userId: number;
  businessName: string;
  ownerName: string;
  businessAddress: string;
  businessRegistrationNumber: string;
  businessType: string;
  verificationStatus: string;
  businessDescription: string;
  employeeCount: number;
  isActive: boolean;
  verificationRequestedAt: string;
  verificationCompletedAt: string;
  verificationRejectionReason: string;
  createdAt: string;
  updatedAt: string;
}
