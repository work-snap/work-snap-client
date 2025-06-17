// 로그인 요청 타입
export interface KakaoLoginRequest {
  code: string;
  userType?: string;
}

// 사용자 정보 타입
export interface User {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  userType: "BUSINESS_OWNER" | "PART_TIME_WORKER" | "PENDING";
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
