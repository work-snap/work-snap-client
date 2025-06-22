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
export type TabType = "auth" | "user" | "business" | "workplace";

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
  | "workplace-register"
  | "workplace-list"
  | "workplace-detail"
  | "workplace-main"
  | "workplace-update"
  | "workplace-delete"
  | "workplace-statistics"
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

// 사업장 관련 타입들 (새로 추가)
export interface WorkplaceRegistrationForm {
  name: string;
  address: string;
  detailAddress?: string;
  phoneNumber?: string;
  description?: string;
  isMain?: boolean;
}

export interface WorkplaceInfo {
  id: number;
  name: string;
  address: string;
  detailAddress?: string;
  phoneNumber?: string;
  description?: string;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkplaceStatistics {
  totalCount: number;
  activeCount: number;
  mainWorkplaceId?: number;
}

// 근무 스케줄 관련 타입들 (새로 추가)
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface WorkScheduleCreateForm {
  workplaceId: number;
  inviteCode: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm" 형식
  endTime: string; // "HH:mm" 형식
}

export interface WorkScheduleUpdateForm {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface WorkSchedule {
  id: number;
  workplaceId: number;
  workplaceName?: string;
  partTimeWorkerId: number;
  inviteCode?: string;
  dayOfWeek: DayOfWeek;
  dayOfWeekKorean: string;
  startTime: string;
  endTime: string;
  workingHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkScheduleStatistics {
  totalSchedules: number;
  activeSchedules: number;
  totalPartTimeWorkers: number;
  totalWeeklyHours: number;
  schedulesByDay: Record<string, number>;
}

// 사업장 정보 타입 (기존 코드와 호환성 위해)
export interface Workplace {
  id: number;
  businessOwnerId: number;
  workplaceName: string;
  workplaceType?: string;
  workplaceAddress: string;
  workplacePhone?: string;
  workplaceEmail?: string;
  workplaceDescription?: string;
  employeeCount?: number;
  operatingHours?: string;
  businessLicenseNumber?: string;
  isMainWorkplace: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입들
export interface WorkScheduleResponse {
  schedules: WorkSchedule[];
  statistics: WorkScheduleStatistics;
}

// 요일 옵션들
export const DAY_OF_WEEK_OPTIONS = [
  { value: "MONDAY" as const, label: "월요일" },
  { value: "TUESDAY" as const, label: "화요일" },
  { value: "WEDNESDAY" as const, label: "수요일" },
  { value: "THURSDAY" as const, label: "목요일" },
  { value: "FRIDAY" as const, label: "금요일" },
  { value: "SATURDAY" as const, label: "토요일" },
  { value: "SUNDAY" as const, label: "일요일" },
];

// 시간 옵션들 (30분 단위)
export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const timeString = `${hour.toString().padStart(2, "0")}:${minute}`;
  return {
    value: timeString,
    label: timeString,
  };
});

// 요일을 한국어로 변환하는 함수
export const getDayOfWeekKorean = (dayOfWeek: DayOfWeek): string => {
  const dayMap: Record<DayOfWeek, string> = {
    MONDAY: "월요일",
    TUESDAY: "화요일",
    WEDNESDAY: "수요일",
    THURSDAY: "목요일",
    FRIDAY: "금요일",
    SATURDAY: "토요일",
    SUNDAY: "일요일",
  };
  return dayMap[dayOfWeek];
};
