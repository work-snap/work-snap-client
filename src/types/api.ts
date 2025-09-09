export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 알바 등록 상태 enum
export enum EmployeeRegistrationStatus {
  NEW_USER = "NEW_USER",
  RETURNING_ACTIVE = "RETURNING_ACTIVE",
  RETURNING_INACTIVE = "RETURNING_INACTIVE",
  TERMINATED = "TERMINATED",
}

// 복구된 데이터 정보
export interface RestoredDataInfo {
  previousContractPeriod?: string;
  restoredPreferences: boolean;
  reactivationCount: number;
}

// 기존 직원 정보
export interface ExistingEmployeeInfo {
  userInfo: {
    userId: number;
    name: string;
    phoneNumber: string;
  };
  contractStartDate: string; // 이전 계약 시작일
  contractEndDate?: string; // 이전 계약 종료일
  currentHourlyWage?: number; // 이전 시급
  status: string; // "TERMINATED", "RETURNING_INACTIVE"
  scheduleCount: number; // 이전 스케줄 개수
  lastActiveDate?: string; // 마지막 활동일
}

// 등록된 직원 정보
export interface RegisteredEmployeeInfo {
  employeeId: number;
  name: string;
  contractPeriod: string; // "2025-02-01 ~ 2025-08-31"
  hourlyWage?: number;
  scheduleCount: number;
}

// 알바 등록 응답
export interface OnboardResponse {
  success: boolean;
  registrationType?: EmployeeRegistrationStatus;
  requiresUserChoice?: boolean; // 사용자 선택 필요 여부
  existingEmployee?: ExistingEmployeeInfo; // 기존 정보 (선택 필요시)
  employeeInfo?: RegisteredEmployeeInfo; // 등록 완료 정보
  restoredData?: RestoredDataInfo; // 복구된 데이터 정보
}
