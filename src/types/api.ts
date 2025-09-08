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

// 알바 등록 응답
export interface OnboardResponse {
  success: boolean;
  registrationType?: EmployeeRegistrationStatus;
  restoredData?: RestoredDataInfo;
}
